import { teamMembers } from '../../config/siteImages';
import { ScrollReveal } from './ScrollAnimations';

export default function Partners() {
    return (
        <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[15%] w-[350px] h-[350px] bg-[#F5C518]/12 rounded-full blur-[100px] animate-float-slow pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[15%] w-[400px] h-[400px] bg-[#F5C518]/8 rounded-full blur-[120px] pointer-events-none animate-float-reverse" />
            <div className="absolute inset-0 bg-transparent -z-10" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <ScrollReveal className="text-center mb-16" delay={100} type="slide" direction="up">
                    <span className="inline-block px-4.5 py-1.5 bg-gradient-to-r from-[#F5C518]/20 to-[#F5C518]/5 text-[#F5C518] text-xs font-black rounded-full mb-4 uppercase tracking-widest border border-[#F5C518]/20">
                        Đội ngũ
                    </span>
                    <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4 font-black tracking-tight">
                        NGƯỜI <span className="text-gradient-gold">SÁNG LẬP</span>
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto font-light">Những con người đam mê công nghệ và khát vọng khởi nghiệp</p>
                </ScrollReveal>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
                    {teamMembers.map(({ name, role, avatar }, i) => (
                        <ScrollReveal key={name} delay={100 * (i + 1)} type="all" direction="up">
                            <div className="group text-center cursor-pointer">
                                <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-5">
                                    {/* Glowing Hover Halo */}
                                    <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-[#F5C518] to-[#FFD700] opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />
                                    {/* Offset Background card */}
                                    <div className="absolute inset-0 rounded-2xl bg-[#F5C518] rotate-6 group-hover:rotate-12 transition-transform duration-350" />
                                    <img
                                        src={avatar}
                                        alt={name}
                                        className="relative w-full h-full rounded-2xl object-cover border-2 border-white/20 transition-all duration-300 group-hover:border-[#F5C518]"
                                    />
                                </div>
                                <h3 className="font-bold text-white text-sm sm:text-base mb-1 group-hover:text-[#F5C518] transition-colors duration-300">{name}</h3>
                                <p className="text-[#F5C518]/70 text-xs font-medium uppercase tracking-wider scale-90">{role}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>

    );
}
