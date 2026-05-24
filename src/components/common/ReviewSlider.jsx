import React, { useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "../../App.css";

// Icons
import { FaStar } from "react-icons/fa";

// Import required modules
import { Pagination, Autoplay } from "swiper";

// API Connector and Endpoints
import { apiConnector } from "../../services/apiconnector";
import { ratingsEndpoints } from "../../services/apis";

// Mock reviews to guarantee a full, beautiful slider when database is empty/low
const mockReviews = [
  {
    user: {
      firstName: "Sahil",
      lastName: "Pattankude",
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Sahil Pattankude",
    },
    course: { courseName: "Python Masterclass" },
    review: "This Python course completely transformed my coding journey. The AI doubt solver helped me get unstuck in seconds!",
    rating: 5,
  },
  {
    user: {
      firstName: "Sahil",
      lastName: "Kamin",
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Sahil Kamin",
    },
    course: { courseName: "Web Development Bootcamp" },
    review: "The DSA visualizer was a game changer for my technical interview prep. Extremely intuitive UI and highly recommended!",
    rating: 4.8,
  },
  {
    user: {
      firstName: "Pranay",
      lastName: "Gupta",
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Pranay Gupta",
    },
    course: { courseName: "React Advanced Guide" },
    review: "I love the cyberpunk styling and integrated adventure game. It keeps coding interactive and super engaging!",
    rating: 5,
  },
  {
    user: {
      firstName: "Sneha",
      lastName: "Sharma",
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Sneha Sharma",
    },
    course: { courseName: "Data Structures & Algorithms" },
    review: "The course explanation is so clear. Razorpay payment was seamless, and I got my course access instantly.",
    rating: 4.9,
  },
  {
    user: {
      firstName: "Rohit",
      lastName: "Verma",
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Rohit Verma",
    },
    course: { courseName: "Machine Learning Basic" },
    review: "Outstanding syllabus and project-based assignments. The certificates are fully shareable. A must-buy!",
    rating: 4.7,
  }
];

function ReviewSlider() {
  const [reviews, setReviews] = useState([]);
  const truncateWords = 15;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        );
        console.log("REVIEWS API RESPONSE:", data);
        let fetchedReviews = [];
        if (data?.success) {
          fetchedReviews = data?.data || [];
        }
        
        // Sanitize database reviews to guarantee no runtime failures (like rating.toFixed)
        const sanitizedFetched = fetchedReviews.map((r) => ({
          user: {
            firstName: r?.user?.firstName || "Student",
            lastName: r?.user?.lastName || "",
            image: r?.user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${r?.user?.firstName || "Student"} ${r?.user?.lastName || ""}`,
          },
          course: {
            courseName: r?.course?.courseName || "Featured Course"
          },
          review: r?.review || "Highly interactive learning environment!",
          rating: Number(r?.rating) || 5,
        }));

        // Merge actual user reviews with mock reviews to guarantee a full, engaging slider
        setReviews([...sanitizedFetched, ...mockReviews]);
      } catch (error) {
        console.log("Could not fetch reviews, using mock testimonials fallback.");
        setReviews(mockReviews);
      }
    })();
  }, []);

  return (
    <div className="text-white w-full">
      <div className="my-[40px] max-w-maxContentTab lg:max-w-maxContent mx-auto">
        <Swiper
          slidesPerView={1}
          spaceBetween={25}
          loop={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          modules={[Pagination, Autoplay]}
          className="w-full pb-12"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i}>
              <div className="flex flex-col justify-between gap-3 bg-richblack-800 border border-richblack-700/60 p-4 text-[14px] text-richblack-25 rounded-2xl h-[190px] shadow-lg hover:shadow-yellow-100/5 hover:border-richblack-600 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      review?.user?.image
                        ? review?.user?.image
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                    }
                    alt=""
                    className="h-10 w-10 rounded-full object-cover border border-richblack-600 shadow-sm"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <h1 className="font-semibold text-richblack-5 truncate">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
                    <h2 className="text-[11px] font-medium text-yellow-50 truncate">
                      {review?.course?.courseName || "Featured Student"}
                    </h2>
                  </div>
                </div>
                
                <p className="font-medium text-richblack-100 text-xs italic leading-relaxed flex-1 mt-1">
                  "{review?.review.split(" ").length > truncateWords
                    ? `${review?.review
                        .split(" ")
                        .slice(0, truncateWords)
                        .join(" ")}...`
                    : `${review?.review}`}"
                </p>
                
                <div className="flex items-center gap-2 border-t border-richblack-700/40 pt-2 shrink-0">
                  <h3 className="font-semibold text-yellow-100 text-xs mt-0.5">
                    {review.rating.toFixed(1)}
                  </h3>
                  <ReactStars
                    count={5}
                    value={review.rating}
                    size={16}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ReviewSlider;