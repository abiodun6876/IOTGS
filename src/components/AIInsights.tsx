import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Lightbulb, AlertTriangle, X } from 'lucide-react';
import { BatteryData, GridData, PowerHistory, WeatherData } from '../types';
import * as tf from '@tensorflow/tfjs';

interface AIInsightsProps {
  batteryData: BatteryData | null;
  gridData: GridData | null;
  powerHistory: PowerHistory[];
  weatherData: WeatherData | null;
}

interface Insight {
  id: string;
  type: 'optimization' | 'prediction' | 'alert' | 'tip' | 'weather';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  dismissed?: boolean;
  weatherIcon?: string;
  timestamp: number;
}

// ML Model types
interface MLResponse {
  prediction: number;
  confidence: number;
  explanation: string;
}

export function AIInsights({ batteryData, gridData, powerHistory, weatherData }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [mlResponses, setMlResponses] = useState<Record<string, MLResponse>>({});
  
  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem('aiInsightsPreferences');
    return saved ? JSON.parse(saved) : {
      dismissedInsights: [] as string[],
      priorityFilter: ['high', 'medium', 'low'],
      typesFilter: ['optimization', 'prediction', 'alert', 'tip', 'weather']
    };
  });

  // Load ML model and responses from local storage
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Try to load model from IndexedDB
        const models = await tf.io.listModels();
        if (models && Object.keys(models).length > 0) {
          const model = await tf.loadLayersModel('indexeddb://energy-insights-model');
          setModel(model);
        } else {
          // Create a simple model if none exists
          const newModel = tf.sequential();
          newModel.add(tf.layers.dense({units: 10, inputShape: [5], activation: 'relu'}));
          newModel.add(tf.layers.dense({units: 5, activation: 'softmax'}));
          newModel.compile({optimizer: 'adam', loss: 'categoricalCrossentropy'});
          setModel(newModel);
          await newModel.save('indexeddb://energy-insights-model');
        }
        
        // Load ML responses from localStorage
        const savedResponses = localStorage.getItem('mlResponses');
        if (savedResponses) {
          setMlResponses(JSON.parse(savedResponses));
        }
        
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, []);

  // Save preferences and ML responses to local storage
  useEffect(() => {
    localStorage.setItem('aiInsightsPreferences', JSON.stringify(userPreferences));
    localStorage.setItem('mlResponses', JSON.stringify(mlResponses));
  }, [userPreferences, mlResponses]);

  // Generate predictions using TensorFlow model
  const generatePrediction = async (inputData: number[]): Promise<MLResponse> => {
    if (!model || inputData.length !== 5) {
      return {
        prediction: 0,
        confidence: 0,
        explanation: 'Model not ready'
      };
    }

    try {
      const inputTensor = tf.tensor2d([inputData]);
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.array() as number[][];
      
      // Get the highest probability
      const maxConfidence = Math.max(...predictionData[0]);
      const predictedClass = predictionData[0].indexOf(maxConfidence);
      
      const explanations = [
        'Normal operation',
        'High consumption expected',
        'Battery drain likely',
        'Solar output reduced',
        'Optimal conditions'
      ];
      
      return {
        prediction: predictedClass,
        confidence: Math.round(maxConfidence * 100),
        explanation: explanations[predictedClass] || 'Unknown state'
      };
    } catch (error) {
      console.error('Prediction error:', error);
      return {
        prediction: 0,
        confidence: 0,
        explanation: 'Prediction failed'
      };
    }
  };

  // Train model with new data
  const trainModel = async (newData: number[][], labels: number[]) => {
    if (!model) return;
    
    try {
      const xs = tf.tensor2d(newData);
      const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), 5);
      
      await model.fit(xs, ys, {
        epochs: 10,
        batchSize: 32,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
          }
        }
      });
      
      await model.save('indexeddb://energy-insights-model');
    } catch (error) {
      console.error('Training error:', error);
    }
  };

  // Generate insights with ML algorithm
  useEffect(() => {
    if (!batteryData || !gridData || !weatherData || powerHistory.length < 5 || isModelLoading) return;

    const generateInsights = async () => {
      const newInsights: Insight[] = [];
      const now = new Date();
      const timestamp = now.getTime();

      // Prepare data for ML prediction
      const inputData = [
        batteryData.level,
        batteryData.temperature,
        powerHistory.slice(-1)[0].consumption,
        powerHistory.slice(-1)[0].solarPower,
        weatherData.temperature
      ];

      // Generate ML prediction
      const predictionKey = `${batteryData.level}_${batteryData.temperature}_${powerHistory.slice(-1)[0].consumption}`;
      let mlResponse = mlResponses[predictionKey];
      
      if (!mlResponse) {
        mlResponse = await generatePrediction(inputData);
        setMlResponses(prev => ({...prev, [predictionKey]: mlResponse}));
        
        // Add to training data (simplified example)
        if (mlResponse.confidence < 70) {
          const newTrainingData = [inputData];
          const labels = [mlResponse.prediction];
          await trainModel(newTrainingData, labels);
        }
      }

      // 1. Battery Health Insights with ML
      if (batteryData) {
        // ML-based battery health prediction
        if (mlResponse.prediction === 2 && mlResponse.confidence > 75) {
          newInsights.push({
            id: `ml-battery-drain-${timestamp}`,
            type: 'alert',
            title: 'ML: Battery Drain Predicted',
            description: `AI predicts battery drain based on current patterns: ${mlResponse.explanation}`,
            confidence: mlResponse.confidence,
            priority: 'high',
            timestamp
          });
        }

        // Battery temperature
        if (batteryData.temperature > 35) {
          newInsights.push({
            id: `battery-temp-${timestamp}`,
            type: 'alert',
            title: 'Battery Temperature Warning',
            description: `Battery temperature is ${batteryData.temperature.toFixed(1)}°C. High temps reduce lifespan.`,
            confidence: 95,
            priority: 'high',
            timestamp
          });
        }
      }

      // 2. Solar Performance Insights with ML
      const solarData = powerHistory.filter(h => h.solarPower > 0);
      if (solarData.length > 0) {
        if (mlResponse.prediction === 3 && mlResponse.confidence > 70) {
          newInsights.push({
            id: `ml-solar-reduction-${timestamp}`,
            type: 'optimization',
            title: 'ML: Solar Output Reduction',
            description: `AI predicts reduced solar output: ${mlResponse.explanation}`,
            confidence: mlResponse.confidence,
            priority: 'medium',
            timestamp
          });
        }
      }

      // 3. Load Analysis with ML
      if (mlResponse.prediction === 1 && mlResponse.confidence > 65) {
        newInsights.push({
          id: `ml-consumption-${timestamp}`,
          type: 'prediction',
          title: 'ML: High Consumption Expected',
          description: `AI predicts increased power demand: ${mlResponse.explanation}`,
          confidence: mlResponse.confidence,
          priority: 'medium',
          timestamp
        });
      }

      // 4. Energy Management Tips with ML
      if (mlResponse.prediction === 4 && mlResponse.confidence > 80) {
        newInsights.push({
          id: `ml-optimal-${timestamp}`,
          type: 'tip',
          title: 'ML: Optimal Conditions',
          description: `AI detects optimal energy conditions: ${mlResponse.explanation}`,
          confidence: mlResponse.confidence,
          priority: 'low',
          timestamp
        });
      }

       // 5. Weather-based Insights
      if (weatherData) {
        // Cloudy weather reducing solar output
        if ([2, 3, 45].includes(weatherData.weatherCode)) {
          newInsights.push({
            id: `weather-cloudy-${now.getTime()}`,
            type: 'weather',
            title: 'Reduced Solar Output Expected',
            description: `Current ${weatherData.description.toLowerCase()} will reduce solar panel efficiency by ~30-60%.`,
            confidence: 85,
            priority: 'medium',
            weatherIcon: weatherData.icon,
            timestamp: 0
          });
        }

        // Rain suggesting panel cleaning
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherData.weatherCode)) {
          newInsights.push({
            id: `panel-cleaning-${now.getTime()}`,
            type: 'tip',
            title: 'Post-Rain Panel Maintenance',
            description: 'After the rain passes, consider cleaning your solar panels to remove any residue for optimal performance.',
            confidence: 75,
            priority: 'low',
            weatherIcon: weatherData.icon,
            timestamp: 0
          });
        }

        // Extreme temperature warnings
        if (weatherData.temperature > 35) {
          newInsights.push({
            id: `high-temp-${now.getTime()}`,
            type: 'alert',
            title: 'High Temperature Alert',
            description: `Temperatures reaching ${weatherData.temperature}°C may reduce battery efficiency and increase cooling needs.`,
            confidence: 90,
            priority: 'high',
            weatherIcon: weatherData.icon,
            timestamp: 0
          });
        } else if (weatherData.temperature < 5) {
          newInsights.push({
            id: `low-temp-${now.getTime()}`,
            type: 'alert',
            title: 'Low Temperature Alert',
            description: `Cold temperatures (${weatherData.temperature}°C) may reduce battery capacity temporarily.`,
            confidence: 80,
            priority: 'medium',
            weatherIcon: weatherData.icon,
            timestamp: 0
          });
        }

        // Thunderstorm warning
        if ([95, 96, 99].includes(weatherData.weatherCode)) {
          newInsights.push({
            id: `storm-warning-${now.getTime()}`,
            type: 'alert',
            title: 'Storm Warning',
            description: 'Thunderstorm detected. Consider securing outdoor equipment and prepare for potential power fluctuations.',
            confidence: 95,
            priority: 'high',
            weatherIcon: weatherData.icon,
            timestamp: 0
          });
        }

        // Weather-based consumption predictions
        const tempTrend = powerHistory.slice(-6).map(h => h.consumption);
        if (tempTrend.length > 1) {
          const consumptionTrend = tempTrend[tempTrend.length - 1] - tempTrend[0];
          
          // Hot weather increasing AC usage
          if (weatherData.temperature > 30 && consumptionTrend > 0) {
            newInsights.push({
              id: `ac-usage-${now.getTime()}`,
              type: 'prediction',
              title: 'Cooling Demand Rising',
              description: `Hot weather (${weatherData.temperature}°C) is increasing AC usage. Consider battery conservation.`,
              confidence: 80,
              priority: 'medium',
              weatherIcon: weatherData.icon,
              timestamp: 0
            });
          }
          
          // Cold weather increasing heating usage
          if (weatherData.temperature < 10 && consumptionTrend > 0) {
            newInsights.push({
              id: `heating-usage-${now.getTime()}`,
              type: 'prediction',
              title: 'Heating Demand Rising',
              description: `Cold weather (${weatherData.temperature}°C) is increasing heating usage. Battery drain may accelerate.`,
              confidence: 80,
              priority: 'medium',
              weatherIcon: weatherData.icon,
              timestamp: 0
            });
          }
        }
      }
      // Filter and sort insights
      const filteredInsights = newInsights
        .filter(insight => !userPreferences.dismissedInsights.includes(insight.id))
        .filter(insight => userPreferences.priorityFilter.includes(insight.priority))
        .filter(insight => userPreferences.typesFilter.includes(insight.type))
        .sort((a, b) => {
          // Sort by priority first, then by confidence
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            priorityOrder[b.priority] - priorityOrder[a.priority] ||
            b.confidence - a.confidence
          );
        })
        .slice(0, 6); // Show top 6 insights

      setInsights(filteredInsights);
    };

    generateInsights();
    const interval = setInterval(generateInsights, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [batteryData, gridData, powerHistory, userPreferences, weatherData, isModelLoading, mlResponses]);

  const dismissInsight = (id: string) => {
    setUserPreferences((prev: { dismissedInsights: any; }) => ({
      ...prev,
      dismissedInsights: [...prev.dismissedInsights, id]
    }));
    
    // Add dismissed insight to training data as negative example
    const dismissedInsight = insights.find(i => i.id === id);
    if (dismissedInsight && model) {
      const inputData = [
        batteryData?.level || 0,
        batteryData?.temperature || 0,
        powerHistory.slice(-1)[0]?.consumption || 0,
        powerHistory.slice(-1)[0]?.solarPower || 0,
        weatherData?.temperature || 0
      ];
      
      // Use a different label (simplified example)
      const labels = [0]; // Normal operation
      trainModel([inputData], labels);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return TrendingUp;
      case 'prediction': return Brain;
      case 'alert': return AlertTriangle;
      case 'tip': return Lightbulb;
      case 'weather': return Lightbulb;
      default: return Brain;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20';
      case 'low': return 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          AI Insights {isModelLoading && '(Loading Model...)'}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            {insights.length} Active
          </span>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{isModelLoading ? 'Loading AI model...' : 'No new insights to show'}</p>
          <p className="text-sm mt-1">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${getInsightColor(insight.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-start gap-2">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getPriorityTextColor(insight.priority)}`} />
                    {insight.weatherIcon && (
                      <span className="text-lg -ml-1 mr-1">{insight.weatherIcon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{insight.title}</h4>
                      <button 
                        onClick={() => dismissInsight(insight.id)}
                        className="text-gray-400 hover:text-white p-1 -mr-2"
                        aria-label="Dismiss insight"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {insight.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityTextColor(insight.priority)} bg-black/20`}>
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          Confidence: {insight.confidence}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(insight.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ML Status and Controls */}
      <div className="mt-6 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isModelLoading ? 'bg-yellow-400' : 'bg-green-400'}`} />
            <span className="text-gray-300">
              {isModelLoading ? 'Loading Model' : `AI Analysis Active (${Object.keys(mlResponses).length} predictions cached)`}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>
    </div>
  );
}