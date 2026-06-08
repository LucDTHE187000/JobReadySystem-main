const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

function updateFile(filePath, transforms) {
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    return;
  }
  let content = fs.readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n');
  let original = content;

  for (const t of transforms) {
    if (t.regex) {
      content = content.replace(t.regex, t.replacement);
    } else {
      const targetNormalized = t.target.replace(/\r\n/g, '\n');
      const replacementNormalized = t.replacement.replace(/\r\n/g, '\n');
      content = content.split(targetNormalized).join(replacementNormalized);
    }
  }

  if (content !== original) {
    fs.writeFileSync(absPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes made for: ${filePath}`);
  }
}

// -------------------------------------------------------------
// 1. CVUpload.jsx
// -------------------------------------------------------------
updateFile('src/pages/CVUpload.jsx', [
  // Subtitle
  { target: 'className="text-white/80"', replacement: 'className="text-slate-700 font-semibold"' },
  // Tab wrapper
  { target: 'bg-white/5 p-1 rounded-xl border border-white/10', replacement: 'bg-slate-200/50 p-1 rounded-xl border border-slate-300/60' },
  // Tab buttons
  { target: "activeTab === 'upload'\n                                    ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm'\n                                    : 'text-white/60 hover:text-white hover:bg-white/5'", replacement: "activeTab === 'upload'\n                                    ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm'\n                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/40'" },
  { target: "activeTab === 'builder'\n                                    ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm'\n                                    : 'text-white/60 hover:text-white hover:bg-white/5'", replacement: "activeTab === 'builder'\n                                    ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm'\n                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/40'" },
  // Alerts
  { target: "message.type === 'success'\n                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 backdrop-blur-md'\n                            : 'bg-red-500/10 border border-red-500/20 text-red-300 backdrop-blur-md'", replacement: "message.type === 'success'\n                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm'\n                            : 'bg-red-50 border border-red-200 text-red-700 shadow-sm'" },
  // Drag zone
  { target: "dragActive\n                                            ? 'border-[#F5C518] bg-white/20 scale-105'\n                                            : 'border-white/20 hover:border-[#F5C518] bg-white/20 hover:bg-white/15'", replacement: "dragActive\n                                            ? 'border-[#F5C518] bg-white scale-105 shadow-xl'\n                                            : 'border-slate-300 hover:border-[#F5C518] bg-white/80 hover:bg-white shadow-md'" },
  // Drag zone texts
  { target: 'text-white font-semibold">Đang tải lên...', replacement: 'text-slate-700 font-semibold">Đang tải lên...' },
  { target: 'text-white font-semibold text-lg">🤖 AI đang phân tích', replacement: 'text-slate-800 font-semibold text-lg">🤖 AI đang phân tích' },
  { target: 'text-sm text-white/70 mt-3">Đang kiểm tra:', replacement: 'text-sm text-slate-600 mt-3">Đang kiểm tra:' },
  { target: 'w-48 h-1 bg-white/10 rounded-full', replacement: 'w-48 h-1 bg-slate-200 rounded-full' },
  { target: 'text-xl font-bold text-white mb-2">Kéo thả CV', replacement: 'text-xl font-bold text-slate-800 mb-2">Kéo thả CV' },
  { target: 'text-sm text-white/60">hoặc click để chọn file', replacement: 'text-sm text-slate-500">hoặc click để chọn file' },
  // Feature box
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-lg text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-8 shadow-lg text-slate-800' },
  { target: 'font-bold text-white mb-4 flex items-center gap-2 text-lg', replacement: 'font-bold text-[#0A2463] mb-4 flex items-center gap-2 text-lg' },
  { target: 'text-white/80', replacement: 'text-slate-600' },
  // CVs list title
  { target: 'text-2xl font-bold text-white mb-6 flex items-center gap-3', replacement: 'text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3' },
  // CV cards
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-xl p-6 border-l-4 border-l-cyan-500 hover:bg-white/15 hover:shadow-lg transition-all duration-300 text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-xl p-6 border-l-4 border-l-cyan-500 hover:bg-white/95 hover:shadow-lg transition-all duration-300 text-slate-800 shadow-md' },
  { target: 'font-semibold text-white text-lg mb-2', replacement: 'font-semibold text-slate-800 text-lg mb-2' },
  { target: 'text-white/60', replacement: 'text-slate-500' },
  { target: 'bg-white/5 px-3 py-2 rounded-lg text-xs border border-white/10 text-white', replacement: 'bg-slate-50 px-3 py-2 rounded-lg text-xs border border-slate-200 text-slate-700' },
  { target: 'font-semibold text-white/70', replacement: 'font-semibold text-slate-600' },
  { target: 'text-white font-bold', replacement: 'text-slate-800 font-bold' },
  // Empty state
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl text-slate-700 shadow-md' },
  // Builder form containers
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md' },
  { target: 'text-white mb-4 border-b pb-2 flex items-center gap-2', replacement: 'text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2' },
  { target: 'bg-white/10 text-[#F5C518]', replacement: 'bg-slate-100 text-[#0A2463]' },
  { target: 'text-white/60 mb-1 uppercase', replacement: 'text-slate-500 mb-1 uppercase font-semibold' },
  { target: 'w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#F5C518]', replacement: 'w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]' },
  { target: 'w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#F5C518] resize-none', replacement: 'w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463] resize-none' },
  { target: 'bg-white/10 text-[#F5C518] border border-white/10 hover:bg-white/15 text-xs font-semibold rounded-lg transition', replacement: 'bg-slate-100 text-[#0A2463] border border-slate-200 hover:bg-slate-200 text-xs font-bold rounded-lg transition' },
  { target: 'border border-white/10 bg-white/5 relative', replacement: 'border border-slate-200 bg-slate-50/50 relative' },
  { target: 'border-white/10 bg-white/5', replacement: 'border-slate-200 bg-slate-50/50' },
  // Sidebar select template
  { target: 'border-white/10 hover:border-[#F5C518]/30 hover:bg-white/5', replacement: 'border-slate-200 hover:border-[#F5C518]/30 hover:bg-slate-50' },
  { target: 'border-[#F5C518] bg-white/20', replacement: 'border-[#F5C518] bg-[#F5C518]/10 text-slate-900' },
  { target: 'text-white/70 mt-1', replacement: 'text-slate-500 mt-1' }
]);

// -------------------------------------------------------------
// 2. CVReportPanel.jsx
// -------------------------------------------------------------
updateFile('src/components/cv/CVReportPanel.jsx', [
  // Container cards
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md' },
  // Details boxes
  { target: 'bg-white/5 rounded-xl p-4 text-xs text-white/70', replacement: 'bg-slate-50 rounded-xl p-4 text-xs text-slate-600 border border-slate-200' },
  { target: 'bg-white/5 rounded-xl p-4 text-center border border-white/5', replacement: 'bg-slate-50 rounded-xl p-4 text-center border border-slate-200/60' },
  // SVGs
  { target: 'stroke="rgba(255,255,255,0.1)"', replacement: 'stroke="rgba(10,36,99,0.1)"' },
  { target: 'fill="rgba(255,255,255,0.6)"', replacement: 'fill="rgba(10,36,99,0.6)"' },
  // Metrics
  { target: 'bg-white/10 rounded-full', replacement: 'bg-slate-100 rounded-full' },
  { target: 'text-white/60', replacement: 'text-slate-500' },
  { target: 'text-white', replacement: 'text-slate-800' },
  { target: 'border-t border-white/10', replacement: 'border-t border-slate-200' },
  { target: 'border border-white/10 rounded-xl text-sm text-white font-medium hover:bg-white/10 transition', replacement: 'border border-slate-200 rounded-xl text-sm text-slate-700 font-medium hover:bg-slate-50 transition' },
  // Alerts
  { target: 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 backdrop-blur-md', replacement: 'text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 shadow-sm' },
  { target: 'text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 backdrop-blur-md', replacement: 'text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-sm' }
]);

// -------------------------------------------------------------
// 3. InterviewPractice.jsx
// -------------------------------------------------------------
updateFile('src/pages/InterviewPractice.jsx', [
  // Alerts
  { target: 'bg-blue-500/10 border border-blue-500/20 backdrop-blur-md rounded-xl flex items-start gap-4 shadow-sm text-white', replacement: 'bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-4 shadow-sm text-slate-800' },
  { target: 'text-white text-sm sm:text-base', replacement: 'text-slate-800 text-sm sm:text-base' },
  { target: 'text-white/70 mt-1', replacement: 'text-slate-600 mt-1' },
  { target: 'bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-xl flex items-start gap-4 shadow-sm text-white', replacement: 'bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4 shadow-sm text-slate-800' },
  { target: 'text-amber-300 font-bold text-sm sm:text-base', replacement: 'text-amber-800 font-bold text-sm sm:text-base' },
  { target: 'text-amber-200 mt-1', replacement: 'text-amber-700 mt-1' },
  { target: 'text-amber-100 mt-1.5 font-mono italic bg-white/5 p-2 rounded-lg border border-white/10', replacement: 'text-amber-700 mt-1.5 font-mono italic bg-amber-50/50 p-2 rounded-lg border border-amber-200' },
  { target: 'bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-xl flex items-start gap-4 shadow-sm text-white', replacement: 'bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4 shadow-sm text-slate-800' },
  { target: 'text-emerald-300 font-bold text-sm sm:text-base', replacement: 'text-emerald-800 font-bold text-sm sm:text-base' },
  { target: 'text-emerald-200 mt-1', replacement: 'text-emerald-700 mt-1' },
  { target: 'text-emerald-100 mt-1.5 font-mono italic bg-white/5 p-2 rounded-lg border border-white/10', replacement: 'text-emerald-700 mt-1.5 font-mono italic bg-emerald-50/50 p-2 rounded-lg border border-emerald-200' },
  // Main form container
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-8 text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-8 text-slate-800 shadow-md' },
  { target: 'bg-red-500/10 border border-red-500/20 rounded-lg text-red-300', replacement: 'bg-red-50 border border-red-200 rounded-lg text-red-700 shadow-sm' },
  { target: 'block text-sm font-semibold text-white mb-2', replacement: 'block text-sm font-semibold text-slate-700 mb-2' },
  { target: 'block text-sm font-semibold text-white mb-3', replacement: 'block text-sm font-semibold text-slate-700 mb-3' },
  // Inputs
  { target: "const inputClass =\n    'w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#F5C518] focus:border-transparent outline-none transition';", replacement: "const inputClass =\n    'w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0A2463] focus:border-transparent outline-none transition';" },
  { target: '<option className="bg-slate-900 text-white"', replacement: '<option className="bg-white text-slate-800"' },
  // Choices type
  { target: "formData.interviewType === value\n                                                    ? 'border-[#F5C518] bg-white/20'\n                                                    : 'border-white/10 hover:border-white/20 bg-white/5'", replacement: "formData.interviewType === value\n                                                    ? 'border-[#F5C518] bg-[#F5C518]/10'\n                                                    : 'border-slate-300 hover:border-slate-400 bg-white'" },
  { target: "formData.interviewType === value ? 'text-[#F5C518]' : 'text-white/40'", replacement: "formData.interviewType === value ? 'text-[#0A2463] font-bold' : 'text-slate-400'" },
  { target: 'font-semibold text-white', replacement: 'font-semibold text-slate-800' },
  { target: 'text-white/70', replacement: 'text-slate-500' },
  // Difficulty levels
  { target: "className={formData.difficultyLevel === d.level ? 'text-[#F5C518] font-bold' : 'text-white/40'}", replacement: "className={formData.difficultyLevel === d.level ? 'text-[#0A2463] font-bold' : 'text-slate-400'}" },
  { target: 'bg-white/15 border border-white/10 rounded-xl', replacement: 'bg-slate-100 border border-slate-200 rounded-xl' },
  // Sidebar cards
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-white border-l-4 border-l-[#F5C518]', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 border-l-4 border-l-[#F5C518] shadow-md' },
  { target: 'font-bold text-white mb-4', replacement: 'font-bold text-[#0A2463] mb-4' },
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md' }
]);

// -------------------------------------------------------------
// 4. Learning.jsx
// -------------------------------------------------------------
updateFile('src/pages/Learning.jsx', [
  // Welcome banner
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-10 text-white mb-8 shadow-xl', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-8 sm:p-10 text-slate-800 mb-8 shadow-md' },
  { target: 'bg-white/10 rounded-full blur-2xl', replacement: 'bg-[#F5C518]/10 rounded-full blur-2xl' },
  // Inactive tab
  { target: 'bg-white/5 text-white/70 hover:text-white border-white/10 hover:bg-white/10', replacement: 'bg-slate-100 text-slate-600 hover:text-slate-800 border-slate-200 hover:bg-slate-200/40' },
  // Empty state catalog
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-12 text-center shadow-sm text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-12 text-center shadow-md text-slate-700' },
  { target: 'text-white/40 mx-auto mb-3', replacement: 'text-slate-400 mx-auto mb-3' },
  { target: 'text-white/80 font-medium', replacement: 'text-slate-700 font-medium' },
  { target: 'text-sm text-white/60 mt-1', replacement: 'text-sm text-slate-500 mt-1' },
  // Lesson cards
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 flex flex-col group text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white hover:-translate-y-1 transition-all duration-300 flex flex-col group text-slate-800 shadow-md' },
  { target: 'text-white/70 text-xs sm:text-sm line-clamp-3 mb-5 leading-relaxed', replacement: 'text-slate-600 text-xs sm:text-sm line-clamp-3 mb-5 leading-relaxed' },
  { target: 'text-xs font-bold text-white truncate', replacement: 'text-xs font-bold text-slate-800 truncate' },
  { target: 'text-[10px] text-white/50 truncate', replacement: 'text-[10px] text-slate-500 truncate' },
  { target: 'border-t border-white/10 pt-4 flex items-center justify-between', replacement: 'border-t border-slate-200 pt-4 flex items-center justify-between' },
  { target: 'text-xs text-white/60 font-medium', replacement: 'text-xs text-slate-500 font-medium' },
  { target: 'bg-white/10 px-2 py-1 rounded-lg border border-white/10 text-white', replacement: 'bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-slate-700' },
  // Player content areas
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl overflow-hidden text-slate-800 shadow-md' },
  { target: 'text-xl font-bold text-white mt-2', replacement: 'text-xl font-bold text-[#0A2463] mt-2' },
  { target: 'text-sm text-white/70 mt-1', replacement: 'text-sm text-slate-600 mt-1' },
  { target: 'border-t border-white/10 pt-6 mt-6', replacement: 'border-t border-slate-200 pt-6 mt-6' },
  { target: 'text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider', replacement: 'text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider' },
  { target: 'bg-white/5 border border-white/10 rounded-xl p-5 text-sm text-white/80', replacement: 'bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-700' },
  // Instructor Card
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left text-slate-800 shadow-md' },
  { target: 'bg-white/10 border border-white/10 text-[#F5C518] flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0', replacement: 'bg-slate-100 border border-slate-200 text-[#0A2463] flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0' },
  { target: 'font-bold text-white text-lg', replacement: 'font-bold text-slate-800 text-lg' },
  { target: 'text-xs text-white/70 leading-relaxed pt-1', replacement: 'text-xs text-slate-600 leading-relaxed pt-1' },
  // Progress card
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-white', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md' },
  { target: 'font-bold text-white mb-4 text-sm uppercase tracking-wider', replacement: 'font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider' },
  { target: 'text-sm text-white/80 mb-2 font-semibold', replacement: 'text-sm text-slate-700 mb-2 font-semibold' },
  { target: 'w-full h-2.5 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/10', replacement: 'w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200' },
  { target: 'text-xs text-white/60 flex justify-between', replacement: 'text-xs text-slate-500 flex justify-between' },
  // Playlist
  { target: 'bg-white/5 border-b border-white/10 px-5 py-4 text-white', replacement: 'bg-slate-100 border-b border-slate-200 px-5 py-4 text-slate-800 font-bold' },
  { target: 'divide-y divide-white/10', replacement: 'divide-y divide-slate-200' },
  { target: 'hover:bg-white/5 cursor-pointer', replacement: 'hover:bg-slate-100/50 cursor-pointer' },
  { target: "isSelected ? 'bg-white/10 border-l-4 border-[#F5C518]' : ''", replacement: "isSelected ? 'bg-[#F5C518]/10 border-l-4 border-[#F5C518]' : ''" },
  { target: "isSelected ? 'text-[#F5C518]' : 'text-white/40'", replacement: "isSelected ? 'text-[#0A2463] font-bold' : 'text-slate-400'" },
  { target: 'text-[10px] text-white/50 font-bold', replacement: 'text-[10px] text-slate-500 font-semibold' },
  { target: 'text-[10px] text-white/50 flex items-center', replacement: 'text-[10px] text-slate-500 flex items-center' },
  { target: "isSelected ? 'text-[#F5C518]' : 'text-white/85'", replacement: "isSelected ? 'text-[#0A2463] font-bold' : 'text-slate-700'" }
]);

// -------------------------------------------------------------
// 5. MyApplications.jsx
// -------------------------------------------------------------
updateFile('src/pages/MyApplications.jsx', [
  // Container cards
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5 hover:bg-white/15 transition-all text-white shadow-xl', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-5 hover:bg-white transition-all text-slate-800 shadow-md' },
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5 hover:bg-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-xl', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-5 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-800 shadow-md' },
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-12 text-center text-white shadow-xl', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-12 text-center text-slate-700 shadow-md' },
  // Texts
  { target: 'text-white/60', replacement: 'text-slate-500' },
  { target: 'text-white/90', replacement: 'text-slate-700' },
  // Tab wrapper
  { target: 'bg-white/5 border border-white/10 rounded-xl p-1 shadow-sm overflow-x-auto', replacement: 'bg-slate-200/50 border border-slate-300/60 rounded-xl p-1 shadow-sm overflow-x-auto' },
  { target: "activeTab === tab.key ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'", replacement: "activeTab === tab.key ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/40'" },
  // Search bar input
  { target: 'className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F5C518]"', replacement: 'className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A2463]"' },
  // Progress step color
  { target: "stepColor = isRejected && i === activeStep ? 'bg-red-500 border-red-500' : done ? 'bg-[#F5C518] border-[#F5C518]' : 'bg-white/10 border-white/20';", replacement: "stepColor = isRejected && i === activeStep ? 'bg-red-500 border-red-500' : done ? 'bg-[#F5C518] border-[#F5C518]' : 'bg-slate-200 border-slate-300';" },
  { target: 'p-2 rounded-lg border border-white/10 text-white disabled:opacity-40 hover:bg-white/10 transition-colors', replacement: 'p-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors' },
  { target: "activeTab === tab.key ? 'bg-[#0A2463]/15 text-[#0A2463]' : 'bg-white/10 text-white/60'", replacement: "activeTab === tab.key ? 'bg-[#0A2463]/10 text-[#0A2463] font-bold' : 'bg-slate-100 text-slate-500'" }
]);

// -------------------------------------------------------------
// 6. Feedback.jsx
// -------------------------------------------------------------
updateFile('src/pages/Feedback.jsx', [
  // Container card
  { target: 'rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-8 shadow-xl text-white', replacement: 'rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-md p-8 shadow-md text-slate-800' },
  // Description
  { target: 'text-white/40', replacement: 'text-slate-400' },
  { target: 'text-white/70', replacement: 'text-slate-600' },
  // Type selection labels
  { target: "type === option\n                      ? 'border-[#F5C518] bg-white/25 text-[#F5C518] shadow-sm'\n                      : 'border-white/10 bg-white/5 text-white/70 hover:border-[#F5C518] hover:bg-white/15'", replacement: "type === option\n                      ? 'border-[#F5C518] bg-[#F5C518]/10 text-[#0A2463] font-bold shadow-sm'\n                      : 'border-slate-300 bg-white text-slate-600 hover:border-[#F5C518] hover:bg-slate-50'" },
  // Input fields
  { target: 'bg-white/5', replacement: 'bg-white' },
  { target: 'border-white/10', replacement: 'border-slate-300' },
  // Status message
  { target: 'bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 backdrop-blur-md', replacement: 'bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 shadow-sm' },
  { target: 'bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300 backdrop-blur-md', replacement: 'bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 shadow-sm' }
]);

// -------------------------------------------------------------
// 7. InterviewHistory.jsx
// -------------------------------------------------------------
updateFile('src/pages/InterviewHistory.jsx', [
  // Badges
  { target: "case 'completed': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20';", replacement: "case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';" },
  { target: "case 'ongoing': return 'bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/20';", replacement: "case 'ongoing': return 'bg-[#F5C518]/20 text-[#0A2463] border border-[#F5C518]/30';" },
  { target: "case 'paused': return 'bg-white/10 text-white/60 border border-white/10';", replacement: "case 'paused': return 'bg-slate-100 text-slate-600 border border-slate-200';" },
  { target: "default: return 'bg-white/10 text-white/60 border border-white/10';", replacement: "default: return 'bg-slate-100 text-slate-600 border border-slate-200';" },
  // Description text
  { target: 'text-white/60 mb-6 -mt-2', replacement: 'text-slate-500 mb-6 -mt-2' },
  // Tab selector
  { target: 'bg-white/5 rounded-xl p-1 shadow-sm border border-white/10 mb-8 flex-wrap gap-1', replacement: 'bg-slate-200/50 rounded-xl p-1 shadow-sm border border-slate-300/60 mb-8 flex-wrap gap-1' },
  { target: "filter === id\n                                    ? 'bg-[#F5C518] text-[#0A2463]'\n                                    : 'text-white/60 hover:text-white hover:bg-white/5'", replacement: "filter === id\n                                    ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm'\n                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/40'" },
  // Loading
  { target: 'text-[#F5C518] mx-auto mb-4', replacement: 'text-[#0A2463] mx-auto mb-4' },
  { target: 'text-white/60">Đang tải', replacement: 'text-slate-500">Đang tải' },
  // Empty
  { target: 'text-white/20 mx-auto mb-4', replacement: 'text-slate-300 mx-auto mb-4' },
  { target: 'text-white/60 mb-4">Chưa có', replacement: 'text-slate-500 mb-4">Chưa có' },
  // Cards
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl hover:bg-white/15 hover:border-[#F5C518]/30 overflow-hidden text-left text-white shadow-xl transition-all', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl hover:bg-white hover:border-[#F5C518]/30 overflow-hidden text-left text-slate-800 shadow-md transition-all' },
  { target: 'bg-white/10 border border-white/10 rounded-full flex items-center justify-center flex-shrink-0', replacement: 'bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0' },
  { target: 'text-[#F5C518]" />', replacement: 'text-[#0A2463]" />' },
  { target: 'font-bold text-white', replacement: 'font-bold text-slate-800' },
  { target: 'bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/20 rounded-full', replacement: 'bg-[#F5C518]/25 text-[#0A2463] border border-[#F5C518]/30 rounded-full font-semibold' },
  { target: 'text-xs text-white/60', replacement: 'text-xs text-slate-500' },
  { target: 'font-bold text-white text-sm', replacement: 'font-bold text-slate-800 text-sm' },
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center', replacement: 'bg-slate-100 border border-slate-200 flex items-center justify-center' },
  { target: 'text-white/40 group-hover:text-white', replacement: 'text-slate-400 group-hover:text-slate-700' }
]);

// -------------------------------------------------------------
// 8. Profile.jsx
// -------------------------------------------------------------
updateFile('src/pages/Profile.jsx', [
  // Balance card
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-white shadow-xl', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md' },
  { target: 'text-white/60 mb-1', replacement: 'text-slate-500 mb-1 font-semibold' },
  // Tab buttons
  { target: "activeTab === key\n            ? 'bg-white/10 text-white border-l-2 border-[#F5C518] font-bold'\n            : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'", replacement: "activeTab === key\n            ? 'bg-[#F5C518]/10 text-[#0A2463] border-l-2 border-[#F5C518] font-bold'\n            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/40 border-l-2 border-transparent'" },
  // Content panel wrapper
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-white shadow-xl', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-slate-800 shadow-md' },
  // Success/error alerts
  { target: "message.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' : 'bg-red-500/15 text-red-300 border border-red-500/25'", replacement: "message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'bg-red-50 text-red-700 border border-red-200 shadow-sm'" },
  // Titles & texts
  { target: 'text-lg font-semibold text-white', replacement: 'text-lg font-semibold text-slate-800' },
  { target: 'text-sm text-white/60 mt-1', replacement: 'text-sm text-slate-500 mt-1' },
  { target: 'text-sm font-medium text-white/80', replacement: 'text-sm font-medium text-slate-700' },
  { target: 'className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-[#F5C518] focus:bg-transparent placeholder:text-white/30 transition-all outline-none"', replacement: 'className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"' },
  { target: 'className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-[#F5C518] focus:bg-transparent placeholder:text-white/30 transition-all outline-none"', replacement: 'className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"' },
  // Readonly field
  { target: 'className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 cursor-not-allowed outline-none"', replacement: 'className="w-full px-4 py-2.5 !bg-slate-100 !border-slate-200 rounded-xl !text-slate-500 cursor-not-allowed outline-none"' }
]);

// -------------------------------------------------------------
// 9. WriteBlog.jsx
// -------------------------------------------------------------
updateFile('src/pages/WriteBlog.jsx', [
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-white shadow-xl', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-slate-800 shadow-md' },
  { target: 'bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-white shadow-xl h-full flex flex-col', replacement: 'bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md h-full flex flex-col' },
  { target: 'text-white/80', replacement: 'text-slate-600' },
  { target: 'text-white/70', replacement: 'text-slate-600' },
  { target: 'text-white/60', replacement: 'text-slate-500' },
  { target: 'border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#F5C518] text-sm bg-white/5 text-white placeholder:text-white/30', replacement: 'border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] text-sm bg-white text-slate-800 placeholder:text-slate-400' }
]);

// -------------------------------------------------------------
// 10. CreditShopPage.jsx
// -------------------------------------------------------------
updateFile('src/pages/CreditShopPage.jsx', [
  // Container
  { target: 'rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-md p-8 shadow-xl text-white', replacement: 'rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-8 shadow-md text-slate-800' },
  { target: 'rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-md p-8 text-white shadow-xl', replacement: 'rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-8 text-slate-800 shadow-md' },
  { target: 'bg-white/5 border border-white/10 p-6', replacement: 'bg-slate-50 border border-slate-200 p-6' },
  // Selected Package
  { target: "selectedPackage.id === pack.id ? 'border-[#F5C518] bg-white/20 shadow-sm' : 'border-white/10 bg-white/5 hover:border-white/25'", replacement: "selectedPackage.id === pack.id ? 'border-[#F5C518] bg-[#F5C518]/10 shadow-sm text-slate-900 font-bold' : 'border-slate-200 bg-white hover:border-[#F5C518]/40 text-slate-700'" },
  { target: 'text-white/80', replacement: 'text-slate-600' },
  { target: 'text-white/60', replacement: 'text-slate-500' },
  { target: 'text-white/70', replacement: 'text-slate-600' },
  // Nút bank manual
  { target: 'border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10', replacement: 'border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200' },
  { target: 'rounded-3xl border border-white/10 bg-white/5 p-6', replacement: 'rounded-3xl border border-slate-200 bg-slate-50 p-6' },
  { target: 'flex items-center gap-3 rounded-3xl bg-white/5 p-4 border border-white/10 mb-6', replacement: 'flex items-center gap-3 rounded-3xl bg-white p-4 border border-slate-200 mb-6 shadow-sm' },
  { target: 'rounded-3xl bg-white p-6 flex items-center justify-center border border-white/10', replacement: 'rounded-3xl bg-white p-6 flex items-center justify-center border border-slate-200 shadow-sm' },
  { target: 'flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5C518] text-[#0A2463]', replacement: 'flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5C518] text-[#0A2463] font-bold' },
  { target: 'bg-white/5 border border-white/10 rounded-3xl p-5 text-left', replacement: 'bg-white border border-slate-200 rounded-3xl p-5 text-left shadow-sm' },
  { target: 'flex items-center justify-between rounded-3xl bg-white/5 border border-white/10 p-4', replacement: 'flex items-center justify-between rounded-3xl bg-white border border-slate-200 p-4 shadow-sm' },
  { target: 'bg-white/10 border border-white/10 p-6 text-white', replacement: 'bg-slate-50 border border-slate-200 p-6 text-slate-700' },
  { target: 'bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-300', replacement: 'bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 shadow-sm' },
  { target: 'bg-white/5 border border-white/10 p-5', replacement: 'bg-slate-50 border border-slate-200 p-5' }
]);

// -------------------------------------------------------------
// 11. InterviewSession.jsx
// -------------------------------------------------------------
updateFile('src/pages/InterviewSession.jsx', [
  // Replace dark session container panels back to clear light cards if needed
  { target: 'bg-[#030A21]/75 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/10 text-white', replacement: 'bg-white/95 border-t lg:border-t-0 lg:border-l border-slate-200 text-slate-800 shadow-xl' },
  { target: 'px-4 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0', replacement: 'px-4 py-3 border-b border-slate-200 flex items-center gap-2 flex-shrink-0' },
  { target: 'text-white font-bold', replacement: 'text-slate-800 font-bold' },
  { target: 'text-white/60 text-xs', replacement: 'text-slate-500 text-xs' },
  { target: 'bg-[#030A21]/60', replacement: 'bg-slate-50/80' },
  { target: 'text-white/70 text-sm leading-relaxed', replacement: 'text-slate-600 text-sm leading-relaxed' },
  { target: 'border-t border-white/10 p-4 flex gap-2 flex-shrink-0', replacement: 'border-t border-slate-200 p-4 flex gap-2 flex-shrink-0' },
  { target: 'bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30', replacement: 'bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400' }
]);

// -------------------------------------------------------------
// 12. InterviewResult.jsx
// -------------------------------------------------------------
updateFile('src/pages/InterviewResult.jsx', [
  // Fix button contrast specifically
  { target: 'bg-white border-2 border-[#0A2463] text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2', replacement: 'bg-white border-2 border-[#0A2463] text-[#0A2463] font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2' },
  { target: 'bg-[#F5C518] text-white font-bold rounded-2xl hover:bg-[#D4A800] transition-all flex items-center justify-center gap-2', replacement: 'bg-[#F5C518] text-[#0A2463] font-bold rounded-2xl hover:bg-[#D4A800] transition-all flex items-center justify-center gap-2' }
]);

console.log('All seeker pages updated successfully to light-glass/charcoal style!');
