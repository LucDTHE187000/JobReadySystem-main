
import Header from '../components/ui/Header';
import Hero from '../components/ui/Hero';
import JobListings from '../components/ui/JobListings';
import Partners from '../components/ui/Partners';
import CallToAction from '../components/ui/CallToAction';
import Footer from '../components/ui/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <Hero />
            <JobListings />
            <Partners />
            <CallToAction />
            <Footer />
        </div>
    );
}
