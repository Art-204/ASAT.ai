// app/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, 
  AreaChart, Area, BarChart, Bar 
} from 'recharts';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const MetricCard = ({ title, value, description = '' }) => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <p className="text-2xl md:text-3xl font-bold text-blue-600">{value}</p>
    {description && <p className="text-sm text-gray-700 mt-1">{description}</p>}
  </div>
);

const ConfusionMatrix = ({ matrix }) => (
  <div className="grid grid-cols-2 gap-2 p-4">
    <div className="bg-green-100 p-4 rounded text-center">
      <p className="font-bold text-gray-900">True Positive</p>
      <p className="text-gray-800">{matrix.truePositive}</p>
    </div>
    <div className="bg-red-100 p-4 rounded text-center">
      <p className="font-bold text-gray-900">False Positive</p>
      <p className="text-gray-800">{matrix.falsePositive}</p>
    </div>
    <div className="bg-red-100 p-4 rounded text-center">
      <p className="font-bold text-gray-900">False Negative</p>
      <p className="text-gray-800">{matrix.falseNegative}</p>
    </div>
    <div className="bg-green-100 p-4 rounded text-center">
      <p className="font-bold text-gray-900">True Negative</p>
      <p className="text-gray-800">{matrix.trueNegative}</p>
    </div>
  </div>
);

const AspectSentimentChart = ({ aspects }) => (
  <div className="h-[300px] md:h-64 w-full px-2 md:px-4">
    <ResponsiveContainer>
      <BarChart
        data={aspects}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          domain={[-1, 1]} 
          tick={{ fill: '#1F2937' }}
        />
        <YAxis 
          dataKey="aspect" 
          type="category" 
          width={80}
          tick={{ fill: '#1F2937' }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
          labelStyle={{ color: '#1F2937' }}
        />
        <Bar dataKey="sentiment" fill="#8884d8">
          {aspects.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.sentiment > 0 ? '#4CAF50' : entry.sentiment < 0 ? '#F44336' : '#9E9E9E'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const AspectCorrelationMatrix = ({ relations }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-4 py-2 text-gray-900">Aspect 1</th>
          <th className="px-4 py-2 text-gray-900">Aspect 2</th>
          <th className="px-4 py-2 text-gray-900">Correlation</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {relations.map((relation, index) => (
          <tr key={index}>
            <td className="px-4 py-2 text-gray-800">{relation.aspect1}</td>
            <td className="px-4 py-2 text-gray-800">{relation.aspect2}</td>
            <td className={`px-4 py-2 font-medium ${
              relation.correlation > 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {relation.correlation.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const HomePage = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const COLORS = ['#4CAF50', '#F44336', '#9E9E9E'];
  const analyzeSentiment = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(`API Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
      }

      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      setAnalysis(parsedData);
    } catch (error) {
      console.error('Full error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Advanced Sentiment Analysis Tool
      </h1>

      <div className="space-y-4 md:space-y-8">
        {/* Input Section */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <textarea
            className="w-full p-4 border rounded-lg shadow-sm min-h-[150px]
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     text-black bg-white"
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={analyzeSentiment}
            disabled={loading || !text.trim()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg
                     hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? <LoadingSpinner /> : 'Analyze Sentiment'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Sentiment Pie Chart */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Overall Sentiment</h2>
              <div className="h-[300px] md:h-64 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Positive', value: analysis.sentimentScores.positive },
                        { name: 'Negative', value: analysis.sentimentScores.negative },
                        { name: 'Neutral', value: analysis.sentimentScores.neutral }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius * 1.4;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="black"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-xs md:text-sm font-medium"
                          >
                            {`${name}: ${value}%`}
                          </text>
                        );
                      }}
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Model Metrics */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Model Performance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <MetricCard 
                  title="Accuracy" 
                  value={`${analysis.modelMetrics.accuracy}%`}
                />
                <MetricCard 
                  title="Precision" 
                  value={analysis.modelMetrics.precision.toFixed(3)}
                />
                <MetricCard 
                  title="Recall" 
                  value={analysis.modelMetrics.recall.toFixed(3)}
                />
                <MetricCard 
                  title="F1 Score" 
                  value={analysis.modelMetrics.f1Score.toFixed(3)}
                />
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Confusion Matrix</h2>
              <ConfusionMatrix matrix={analysis.confusionMatrix} />
            </div>

            {/* ROC Curve */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">ROC Curve</h2>
              <div className="h-[300px] md:h-64 w-full">
                <ResponsiveContainer>
                  <LineChart
                    data={analysis.rocCurve.falsePositiveRate.map((fpr, index) => ({
                      fpr,
                      tpr: analysis.rocCurve.truePositiveRate[index]
                    }))}
                    margin={{ top: 20, right: 30, left: 80, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="fpr" 
                      tick={{ fill: '#1F2937', fontSize: 12 }}
                      tickSize={8}
                      label={{ 
                        value: 'False Positive Rate', 
                        position: 'insideBottom',
                        offset: -35,
                        fill: '#1F2937',
                        fontSize: 14,
                        fontWeight: 500
                      }} 
                    />
                    <YAxis 
                      tick={{ fill: '#1F2937', fontSize: 12 }}
                      tickSize={8}
                      label={{ 
                        value: 'True Positive Rate', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: '#1F2937',
                        fontSize: 14,
                        fontWeight: 500,
                        dx: -60,
                        dy: 40
                      }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                      labelStyle={{ color: '#1F2937' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tpr" 
                      stroke="#8884d8"
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center mt-4 text-gray-900 font-medium">
                AUC Score: {analysis.aucScore.toFixed(3)}
              </p>
            </div>

            {/* Sentiment Distribution */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md md:col-span-2">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Sentiment Distribution</h2>
              <div className="h-[300px] md:h-64 w-full">
                <ResponsiveContainer>
                  <AreaChart
                    data={[
                      { name: 'Very Negative', value: analysis.sentimentDistribution.veryNegative },
                      { name: 'Negative', value: analysis.sentimentDistribution.negative },
                      { name: 'Neutral', value: analysis.sentimentDistribution.neutral },
                      { name: 'Positive', value: analysis.sentimentDistribution.positive },
                      { name: 'Very Positive', value: analysis.sentimentDistribution.veryPositive }
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: '#1F2937' }} />
                    <YAxis tick={{ fill: '#1F2937' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ABSA Section */}
            <div className="md:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Aspect-Based Sentiment Analysis</h2>

              {/* Aspect Sentiment Overview */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Aspect Sentiments</h3>
                <AspectSentimentChart aspects={analysis.aspectBasedAnalysis.aspects} />
              </div>

              {/* Top Aspects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                {analysis.aspectBasedAnalysis.topAspects.map((aspect, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900">{aspect.aspect}</h4>
                    <p className="text-sm text-gray-800">Frequency: {aspect.frequency}</p>
                    <p className="text-sm text-gray-800">
                      Sentiment: {aspect.averageSentiment.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Aspect Details */}
              <div className="space-y-3 md:space-y-4">
                {analysis.aspectBasedAnalysis.aspects.map((aspect, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900">{aspect.aspect}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-800">
                          Sentiment: {aspect.sentiment.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-800">
                          Confidence: {(aspect.confidence * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-800">
                          Mentions: {aspect.mentions}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Keywords:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {aspect.keywords.map((keyword, kidx) => (
                            <span key={kidx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">Examples:</p>
                      <ul className="list-disc list-inside text-sm text-gray-800">
                        {aspect.examples.map((example, eidx) => (
                          <li key={eidx}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Aspect Correlations */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Aspect Correlations</h3>
                <AspectCorrelationMatrix relations={analysis.aspectBasedAnalysis.aspectRelations} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
  };

  export default HomePage;