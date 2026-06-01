import { teamMembers } from '../../config/siteImages';

export default function Partners() {
    return (
        <section className="py-16 lg:py-24 bg-navy relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <span className="inline-block px-4 py-1.5 bg-gold/15 text-gold text-sm font-bold rounded-full mb-4 uppercase tracking-wide">Đội ngũ</span>
                    <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
                        NGƯỜI <span className="text-gold">SÁNG LẬP</span>
                    </h2>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">Những con người đam mê công nghệ và giáo dục nghề nghiệp</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                    {teamMembers.map(({ name, role, avatar }) => (
                        <div key={name} className="group text-center card-hover">
                            <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-4">
                                <div className="absolute inset-0 rounded-2xl bg-gold rotate-6 group-hover:rotate-12 transition-transform" />
                                <img
                                    src={avatar}
                                    alt={name}
                                    className="relative w-full h-full rounded-2xl object-cover border-2 border-white/20"
                                />
                            </div>
                            <h3 className="font-semibold text-white text-sm sm:text-base mb-1">{name}</h3>
                            <p className="text-gold/70 text-xs">{role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
