import { Link } from 'react-router-dom';
import { BrainCircuit, FileText, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';

function MetricBar({ label, value, color }) {
    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800">{value}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
            </div>
        </div>
    );
}

function RadarVisual({ scores }) {
    const labels = ['Technical', 'Leadership', 'Communication', 'Strategic', 'Industry'];
    const values = scores || [88, 75, 94, 63, 81];
    const cx = 80, cy = 80, r = 60;
    const points = values.map((v, i) => {
        const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
        const rad = (v / 100) * r;
        return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`;
    }).join(' ');

    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 160 160" className="w-40 h-40">
                {[25, 50, 75, 100].map((pct) => (
                    <polygon
                        key={pct}
                        points={values.map((_, i) => {
                            const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
                            const rad = (pct / 100) * r;
                            return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`;
                        }).join(' ')}
                        fill="none"
                        stroke="rgba(10,36,99,0.1)"
                        strokeWidth="1"
                    />
                ))}
                <polygon points={points} fill="rgba(245,197,24,0.15)" stroke="#F5C518" strokeWidth="2" />
                {/* Draw vertex labels and small value markers */}
                {values.map((v, i) => {
                    const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
                    const lx = cx + (r + 12) * Math.cos(angle);
                    const ly = cy + (r + 12) * Math.sin(angle);
                    // determine text anchor based on quadrant
                    let anchor = 'middle';
                    const deg = (angle + Math.PI * 2) % (Math.PI * 2);
                    if (deg > 0 && deg < Math.PI / 2) anchor = 'start';
                    else if (deg > Math.PI / 2 && deg < (3 * Math.PI) / 2) anchor = 'end';
                    else if (deg > (3 * Math.PI) / 2) anchor = 'start';

                    const vx = cx + (r + 4) * Math.cos(angle);
                    const vy = cy + (r + 4) * Math.sin(angle);

                    return (
                        <g key={i}>
                            <circle cx={vx} cy={vy} r={3} fill="#F5C518" />
                            <text x={lx} y={ly} fontSize="10" fill="#F5C518" textAnchor={anchor} alignmentBaseline="middle">
                                {labels[i]}
                            </text>
                            <text x={lx} y={ly + 10} fontSize="9" fill="rgba(10,36,99,0.6)" textAnchor={anchor} alignmentBaseline="hanging">
                                {v}%
                            </text>
                        </g>
                    );
                })}
            </svg>
            <p className="text-center text-sm font-bold text-slate-800 mt-2">
                {Math.round(values.reduce((a, b) => a + b, 0) / values.length)}% Tỷ lệ khớp
            </p>
            <div className="grid grid-cols-1 gap-1 mt-3 w-full text-xs">
                {labels.map((l, i) => (
                    <div key={l} className="flex justify-between text-slate-500">
                        <span>{l}</span>
                        <span className="font-semibold">{values[i]}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function CVReportPanel({ analysis, fileName, onClose }) {
    if (!analysis) return null;
    const score = analysis.score ?? 0;
    const breakdown = analysis.scoreBreakdown || {
        structure: 70, content: 65, language: 80, relevance: 55,
    };
    const skillScores = [
        breakdown.relevance || 63,
        breakdown.content || 75,
        breakdown.structure || 88,
        breakdown.language || 81,
        Math.round((breakdown.structure + breakdown.content) / 2) || 94,
    ];

    // Expand arrays to a target count by splitting sentences and using fallback text
    const expandToCount = (list, fallbacks = [], count = 10) => {
        const out = [];
        const pushIfUnique = (s) => {
            if (!s) return;
            const t = s.trim();
            if (!t) return;
            if (!out.includes(t)) out.push(t);
        };

        // add original items first
        (list || []).forEach(item => pushIfUnique(item));

        // split original items into sentences to generate more entries
        if (out.length < count) {
            (list || []).forEach(item => {
                if (!item) return;
                item.toString().split(/(?<=[.?!])\s+/).forEach(sent => pushIfUnique(sent.replace(/^[-•\s]+/, '').trim()));
            });
        }

        // use fallback text sources (overallFeedback, rawPreview, etc.)
        if (out.length < count) {
            (fallbacks || []).forEach(src => {
                if (!src) return;
                src.toString().split(/(?<=[.?!])\s+/).forEach(sent => pushIfUnique(sent.replace(/^[-•\s]+/, '').trim()));
            });
        }

        // pad with empty strings if still short (keeps UI consistent)
        return out.slice(0, count);
    };

    // Prefer skillDetails from analysis if available, else fall back to top-level arrays
    const strengthsSource = (analysis.skillDetails && Array.isArray(analysis.skillDetails.strengths) && analysis.skillDetails.strengths.length > 0)
        ? analysis.skillDetails.strengths
        : (analysis.strengths || []);
    const suggestionsSource = (analysis.skillDetails && Array.isArray(analysis.skillDetails.suggestions) && analysis.skillDetails.suggestions.length > 0)
        ? analysis.skillDetails.suggestions
        : (analysis.suggestions || []);

    const strengthsList = expandToCount(strengthsSource, [analysis.overallFeedback, analysis.rawPreview], 10);
    const suggestionsList = expandToCount(suggestionsSource, [analysis.overallFeedback, analysis.rawPreview], 10);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs text-slate-500 mb-1">Activity Hub › CV Marking Report</p>
                    <h2 className="text-2xl font-bold text-slate-800">Kết quả phân tích CV</h2>
                    <p className="text-sm text-slate-500">{fileName}</p>
                </div>
                <div className="text-right">
                    <p className="text-5xl font-extrabold text-emerald-600">{score}%</p>
                    <p className="text-sm text-slate-500">Điểm ATS tổng quát</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link to="/interview" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5C518] text-slate-800 rounded-xl text-sm font-bold hover:bg-[#D4A800] transition">
                    <BrainCircuit size={18} /> Luyện phỏng vấn AI
                </Link>
                <button type="button" className="px-4 py-2.5 border border-[#DDE3F0] rounded-xl text-sm text-slate-800 font-medium hover:bg-white">
                    Xuất kết quả
                </button>
                {onClose && (
                    <button type="button" onClick={onClose} className="px-4 py-2.5 text-slate-500 text-sm">
                        Phân tích CV khác
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={18} /> Xem trước CV
                    </h3>
                    <div className="bg-[#F4F6FB] rounded-xl p-4 text-xs text-slate-500 max-h-64 overflow-y-auto leading-relaxed">
                        {analysis.rawPreview || 'CV đã được phân tích. Xem chi tiết bên phải.'}
                    </div>
                </div>

                <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200/60">
                            <p className="text-2xl font-bold text-slate-800">{score}</p>
                            <p className="text-xs text-slate-500">Điểm ATS</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200/60">
                            <p className="text-2xl font-bold text-slate-800">{analysis.keywordMatch ?? '1/8'}</p>
                            <p className="text-xs text-slate-500">Từ khóa phù hợp</p>
                        </div>
                    </div>
                    {score >= 60 ? (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 shadow-sm">
                            <CheckCircle2 size={18} /> Ngữ pháp và định dạng tốt — đủ điều kiện luyện phỏng vấn
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-sm">
                            <AlertTriangle size={18} /> Cần cải thiện CV (≥60 điểm) để mở khóa phỏng vấn AI
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                    <h3 className="font-semibold text-slate-800 mb-4">Bảng điểm kỹ năng</h3>
                    <RadarVisual scores={skillScores} />
                </div>
                <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                    <h3 className="font-semibold text-slate-800 mb-4">Phân tích ATS</h3>
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-28 h-28 rounded-full border-8 border-[#F5C518] flex items-center justify-center">
                            <span className="text-xl font-bold text-slate-800">{Math.min(92, score + 10)}%</span>
                        </div>
                    </div>
                    <MetricBar label="Keyword density" value={95} color="bg-emerald-500" />
                    <MetricBar label="Format compliance" value={breakdown.structure || 98} color="bg-[#0A2463]" />
                    <MetricBar label="Content relevance" value={breakdown.relevance || 85} color="bg-[#F5C518]" />
                    {analysis.overallFeedback && (
                        <p className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-200">{analysis.overallFeedback}</p>
                    )}
                </div>
            </div>

            {(analysis.strengths?.length > 0 || analysis.suggestions?.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                    {strengthsList.length > 0 && (
                        <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                            <h4 className="font-semibold text-green-700 mb-3">Điểm mạnh</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                {strengthsList.map((s, i) => <li key={i}>✓ {s}</li>)}
                            </ul>
                        </div>
                    )}
                    {analysis.suggestions?.length > 0 && (
                        <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                            <h4 className="font-semibold text-slate-800 mb-3">Gợi ý cải thiện</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                {suggestionsList.map((s, i) => <li key={i}>→ {s}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
