import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal } from '../components/ui/ScrollAnimations';
import { siteImages } from '../config/siteImages';

export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setName('');
        setEmail('');
        setMessage('');
        setTimeout(() => setSent(false), 5000);
    };

    return (
        <div 
            className="min-h-screen text-white font-sans relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed flex flex-col justify-between"
            style={{ backgroundImage: `url(${siteImages.guestBg})` }}
        >
            {/* Premium backdrop-blur and dark-gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#030a21]/85 via-[#051336]/80 to-[#030a21]/90 backdrop-blur-[3px] pointer-events-none" />

            <div>
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
                    <ScrollReveal className="text-center mb-16" delay={100} type="slide" direction="up">
                        <span className="inline-block px-4.5 py-1.5 bg-[#F5C518]/15 border border-[#F5C518]/25 text-[#F5C518] text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
                            Liên hệ
                        </span>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4 font-black tracking-tight">
                            LIÊN HỆ VỚI <span className="text-gradient-gold">JOBREADY</span>
                        </h1>
                        <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
                            Chúng tôi luôn sẵn sàng lắng nghe mọi phản hồi, hợp tác hoặc hỗ trợ từ bạn.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                        {/* Contact details */}
                        <ScrollReveal delay={150} type="slide" direction="left" className="space-y-8">
                            <div className="border border-white/10 bg-white/5 backdrop-blur-md p-8 rounded-3xl space-y-6 hover:bg-white/10 transition-all duration-300">
                                <h3 className="text-xl font-bold text-[#F5C518]">Thông tin liên hệ</h3>
                                <p className="text-white/70 text-sm font-light leading-relaxed">
                                    Đội ngũ JobReady sẽ phản hồi bạn sớm nhất khi nhận được thông tin.
                                </p>
                                
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F5C518]">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-xs">Email hỗ trợ</p>
                                            <p className="font-semibold text-white">duongtrongluc31072004@gmail.com</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F5C518]">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-xs">Điện thoại</p>
                                            <p className="font-semibold text-white">+84 366 188 654</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F5C518]">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-xs">Địa chỉ</p>
                                            <p className="font-semibold text-white">Khu công nghệ cao Hòa Lạc, Hà Nội</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Contact Form */}
                        <ScrollReveal delay={250} type="scale">
                            <div className="border border-white/10 bg-white/5 backdrop-blur-md p-8 rounded-3xl hover:bg-white/10 transition-all duration-300">
                                <h3 className="text-xl font-bold text-white mb-6">Gửi tin nhắn cho chúng tôi</h3>
                                {sent && (
                                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm">
                                        Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất.
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Họ và tên</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] text-white placeholder:text-white/30 text-sm"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@email.com"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] text-white placeholder:text-white/30 text-sm"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Lời nhắn</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Nhập nội dung cần hỗ trợ hoặc hợp tác..."
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] text-white placeholder:text-white/30 text-sm"
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] font-black rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm"
                                    >
                                        Gửi liên hệ <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
            <Footer theme="dark" />
        </div>
    );
}
