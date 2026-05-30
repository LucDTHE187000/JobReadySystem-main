import { useState } from 'react';
import { X, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Zap, Target, TrendingUp } from 'lucide-react';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: [analysis, onClose]
 * Description: Beautiful modal displaying CV analysis results with AI-generated score, breakdown, and feedback
 */
export default function CVAnalysisResult({ analysis, onClose }) {
    const [expandedSections, setExpandedSections] = useState({
        strengths: false,
        improvements: false,
        suggestions: false,
    });

    if (!analysis) return null;

    const score = analysis.score || 0;
    const isPassing = score >= 60;

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Score breakdown with color coding
    const breakdown = analysis.scoreBreakdown || {
        structure: 0,
        content: 0,
        language: 0,
        relevance: 0,
    };

    const metricsData = [
        { label: 'Cấu trúc', value: breakdown.structure || 0, color: 'from-emerald-400 to-emerald-600', icon: '📋' },
        { label: 'Nội dung', value: breakdown.content || 0, color: 'from-cyan-400 to-cyan-600', icon: '📝' },
        { label: 'Ngôn ngữ', value: breakdown.language || 0, color: 'from-purple-400 to-purple-600', icon: '🌐' },
        { label: 'Phù hợp', value: breakdown.relevance || 0, color: 'from-orange-400 to-orange-600', icon: '🎯' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-cyan-50 px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Kết Quả Đánh Giá CV</h2>
                        <p className="text-sm text-gray-600 mt-1">Phân tích chi tiết từ AI</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-8">
                    {/* Status Badge & Overall Score */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            {isPassing ? (
                                <div className="px-4 py-2 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <span className="font-bold text-emerald-700">ĐỦ ĐIỀU KIỆN</span>
                                </div>
                            ) : (
                                <div className="px-4 py-2 bg-red-100 border-2 border-red-500 rounded-full flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <span className="font-bold text-red-700">CẦN CẢI THIỆN</span>
                                </div>
                            )}
                        </div>

                        {/* Overall Score with Circular Progress */}
                        <div className="flex items-center gap-8">
                            <div className="flex-shrink-0 relative w-32 h-32">
                                <svg className="w-32 h-32 absolute inset-0">
                                    {/* Background circle */}
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        fill="none"
                                        stroke="#f3f4f6"
                                        strokeWidth="8"
                                    />
                                    {/* Progress circle */}
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#06b6d4" />
                                            <stop offset="100%" stopColor="#0ea5e9" />
                                        </linearGradient>
                                    </defs>
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        fill="none"
                                        stroke="url(#scoreGradient)"
                                        strokeWidth="8"
                                        strokeDasharray={`${(score / 100) * 351.86} 351.86`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 64 64)"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-gray-900">{score}</p>
                                        <p className="text-sm text-gray-600">/100</p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Text */}
                            <div className="flex-1">
                                <p className="text-xl font-semibold text-gray-900 mb-3">
                                    {isPassing ? '🎉 CV của bạn rất tốt!' : '📈 CV cần được cải thiện'}
                                </p>
                                <p className="text-gray-700 leading-relaxed">
                                    {analysis.recommendation ||
                                        (isPassing
                                            ? 'CV của bạn đạt tiêu chuẩn và sẵn sàng để ứng tuyển các công việc. Hãy tiếp tục luyện tập phỏng vấn để tăng cơ hội thành công.'
                                            : 'CV của bạn cần được cải thiện trước khi ứng tuyển. Hãy xem các gợi ý bên dưới để cải thiện CV.')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Score Breakdown Grid */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân Tích Chi Tiết</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {metricsData.map((metric, idx) => (
                                <div key={idx} className={`bg-gradient-to-br ${metric.color} rounded-2xl p-6 text-white`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl">{metric.icon}</span>
                                        <span className="text-2xl font-bold">{metric.value}/100</span>
                                    </div>
                                    <p className="font-semibold mb-3">{metric.label}</p>
                                    <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                                        <div
                                            className="bg-white rounded-full h-2 transition-all duration-700"
                                            style={{ width: `${metric.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Radar Chart - Bản đồ năng lực */}
                    <div className="mb-8 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-6 border border-emerald-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Bản Đồ Năng Lực</h3>
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                            <div className="flex-shrink-0">
                                <svg viewBox="0 0 200 200" className="w-64 h-64">
                                    {/* Grid circles */}
                                    {[25, 50, 75, 100].map((pct) => (
                                        <polygon
                                            key={pct}
                                            points={metricsData.map((_, i) => {
                                                const angle = (Math.PI * 2 * i) / metricsData.length - Math.PI / 2;
                                                const rad = (pct / 100) * 70;
                                                return `${100 + rad * Math.cos(angle)},${100 + rad * Math.sin(angle)}`;
                                            }).join(' ')}
                                            fill="none"
                                            stroke="#e0e7ff"
                                            strokeWidth="1"
                                        />
                                    ))}

                                    {/* Data polygon - filled */}
                                    <polygon
                                        points={metricsData.map((metric, i) => {
                                            const angle = (Math.PI * 2 * i) / metricsData.length - Math.PI / 2;
                                            const rad = (metric.value / 100) * 70;
                                            return `${100 + rad * Math.cos(angle)},${100 + rad * Math.sin(angle)}`;
                                        }).join(' ')}
                                        fill="#10b981"
                                        fillOpacity="0.15"
                                        stroke="#059669"
                                        strokeWidth="2"
                                    />

                                    {/* Vertex labels and scores */}
                                    {metricsData.map((metric, i) => {
                                        const angle = (Math.PI * 2 * i) / metricsData.length - Math.PI / 2;
                                        const rad = 95;
                                        const x = 100 + rad * Math.cos(angle);
                                        const y = 100 + rad * Math.sin(angle);
                                        return (
                                            <g key={i}>
                                                <text
                                                    x={x}
                                                    y={y}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-xs font-bold fill-gray-900"
                                                    fontSize="12"
                                                >
                                                    {metric.label}
                                                </text>
                                                <text
                                                    x={x}
                                                    y={y + 14}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-xs font-semibold fill-emerald-600"
                                                    fontSize="11"
                                                >
                                                    {metric.value}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700 mb-4">
                                    Biểu đồ radar hiển thị từng khía cạnh của CV của bạn được đánh giá bởi AI:
                                </p>
                                <div className="space-y-3">
                                    {metricsData.map((metric, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="text-2xl">{metric.icon}</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">{metric.label}</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full h-2"
                                                        style={{ width: `${metric.value}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-600 min-w-10">{metric.value}/100</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Keyword Match */}
                    {analysis.keyword_match !== undefined && (
                        <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Từ Khóa Phù Hợp</h3>
                            </div>
                            <div className="flex items-center gap-6">
                                <svg className="w-24 h-24" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f3e8ff" strokeWidth="8" />
                                    <defs>
                                        <linearGradient id="keywordGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#d946ef" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="url(#keywordGradient)"
                                        strokeWidth="8"
                                        strokeDasharray={`${(analysis.keyword_match / 100) * 282.74} 282.74`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                        className="transition-all duration-1000"
                                    />
                                    <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-3xl font-bold fill-purple-700">
                                        {Math.round(analysis.keyword_match)}%
                                    </text>
                                </svg>
                                <div>
                                    <p className="text-sm text-gray-700">
                                        CV của bạn chứa {Math.round(analysis.keyword_match)}% các từ khóa quan trọng phù hợp với ngành.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Expandable Feedback Sections */}

                    {/* Strengths */}
                    {analysis.strengths && analysis.strengths.length > 0 && (
                        <div className="mb-4 border border-emerald-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleSection('strengths')}
                                className="w-full flex items-center justify-between p-6 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <span className="font-semibold text-gray-900">Điểm Tốt ({analysis.strengths.length})</span>
                                </div>
                                {expandedSections.strengths ? (
                                    <ChevronUp className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-emerald-600" />
                                )}
                            </button>
                            {expandedSections.strengths && (
                                <div className="px-6 py-4 bg-white space-y-3">
                                    {analysis.strengths.map((strength, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                            <p className="text-gray-700">{strength}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Weaknesses */}
                    {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                        <div className="mb-4 border border-orange-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleSection('improvements')}
                                className="w-full flex items-center justify-between p-6 bg-orange-50 hover:bg-orange-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    <span className="font-semibold text-gray-900">Điểm Yếu ({analysis.weaknesses.length})</span>
                                </div>
                                {expandedSections.improvements ? (
                                    <ChevronUp className="w-5 h-5 text-orange-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-orange-600" />
                                )}
                            </button>
                            {expandedSections.improvements && (
                                <div className="px-6 py-4 bg-white space-y-3">
                                    {analysis.weaknesses.map((weakness, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <span className="text-orange-500 font-bold mt-0.5">!</span>
                                            <p className="text-gray-700">{weakness}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Suggestions */}
                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                        <div className="mb-4 border border-cyan-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleSection('suggestions')}
                                className="w-full flex items-center justify-between p-6 bg-cyan-50 hover:bg-cyan-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-cyan-600" />
                                    <span className="font-semibold text-gray-900">Gợi Ý Cải Thiện ({analysis.suggestions.length})</span>
                                </div>
                                {expandedSections.suggestions ? (
                                    <ChevronUp className="w-5 h-5 text-cyan-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-cyan-600" />
                                )}
                            </button>
                            {expandedSections.suggestions && (
                                <div className="px-6 py-4 bg-white space-y-3">
                                    {analysis.suggestions.map((suggestion, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <span className="text-cyan-500 font-bold mt-0.5">💡</span>
                                            <p className="text-gray-700">{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Feedback Summary */}
                    {analysis.feedback && (
                        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Nhận Xét Chung</h3>
                                    <p className="text-gray-700 leading-relaxed">{analysis.feedback}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        💾 Lưu kết quả này để theo dõi tiến độ cải thiện
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
