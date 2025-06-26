import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Logo array with updated paths and alt text
const logos = [
  { src: '/images/logogooogle.png', alt: 'Google logo' },
  { src: '/images/logoamazon.png', alt: 'Amazon logo' },
  { src: '/images/logoacccenture.png', alt: 'Accenture logo' },
  { src: '/images/logocognizant.png', alt: 'Cognizant logo' },
  { src: '/images/logomicrosoft.png', alt: 'Microsoft logo' },
  { src: '/images/deloitee.png', alt: 'Deloitte logo' }, // Kept your filename 'deloittee.png'
];

export default function LogoSlider() {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 2 } // Changed from 1 to 2 for mobile
      }
    ]
  };

  return (
    <section className="py-12 bg-transparent">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-2xl font-bold text-blue-600 mb-4">
            Get Hired by Top Companies
          </h2>
          <p className="text-gray-700 text-lg mb-6 max-w-xl mx-auto md:ml-auto">
            Get hired by top companies with Webflie’s ATS resume checker!
          </p>
        </motion.div>
        <Slider {...sliderSettings} className="mt-6">
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="px-2"
            >
              <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-12 mx-auto object-contain"
                />
              </div>
            </motion.div>
          ))}
        </Slider>
      </div>
    </section>
  );
}