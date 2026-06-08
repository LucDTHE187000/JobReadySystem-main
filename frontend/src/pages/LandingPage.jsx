
import Header from '../components/ui/Header';
import Hero from '../components/ui/Hero';
import JobListings from '../components/ui/JobListings';
import Partners from '../components/ui/Partners';
import Testimonials from '../components/ui/Testimonials';
import CallToAction from '../components/ui/CallToAction';
import Footer from '../components/ui/Footer';
import { siteImages } from '../config/siteImages';

export default function LandingPage() {
    return (
        <div 
            className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
            style={{ backgroundImage: `url(${siteImages.guestBg})` }}
        >
            {/* Premium backdrop-blur and dark-gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-zinc-950/70 to-black/90 backdrop-blur-[3px] pointer-events-none" />

            <div className="relative z-10">
                <Header />
                <Hero />
                <JobListings />
                <Partners />
                <Testimonials />
                <CallToAction />
                <Footer theme="dark" />
            </div>
        </div>
    );
}
