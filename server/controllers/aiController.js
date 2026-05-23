const axios = require("axios");
const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const today = new Date().toDateString();

exports.courseDoubtSolver = async (req, res) => {
  try {
    const { question, courseId } = req.body;

    // Fetch all published courses to provide dynamic catalog context
    let coursesContext = "";
    try {
      const publishedCourses = await Course.find({ status: "Published" })
        .populate("instructor", "firstName lastName email")
        .populate("category", "name description");

      if (publishedCourses && publishedCourses.length > 0) {
        coursesContext = publishedCourses.map((course, idx) => {
          const instructorName = course.instructor 
            ? `${course.instructor.firstName} ${course.instructor.lastName}` 
            : "Expert Instructor";
          const categoryName = course.category ? course.category.name : "Tech";
          return `Course #${idx + 1}:
- Title: ${course.courseName}
- Category: ${categoryName}
- Price: INR ${course.price}
- Instructor: ${instructorName}
- Description: ${course.courseDescription}
- What you will learn: ${course.whatYouWillLearn || "N/A"}
`;
        }).join("\n\n");
      } else {
        coursesContext = "No courses currently published on Codeverse.";
      }
    } catch (err) {
      console.error("Error fetching courses for AI context:", err);
      coursesContext = "Unable to fetch course catalog at the moment.";
    }

    // Fetch context for the active course if courseId exists
    let activeCourseContext = "";
    if (courseId) {
      try {
        const course = await Course.findById(courseId)
          .populate("instructor", "firstName lastName")
          .populate("category", "name");
        if (course) {
          activeCourseContext = `The student is currently viewing/studying this specific course:
- Course Title: ${course.courseName}
- Description: ${course.courseDescription}
- Category: ${course.category ? course.category.name : "Tech"}
- Instructor: ${course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : "Expert"}
`;
        }
      } catch (err) {
        console.error("Error fetching active course context:", err);
      }
    }

    const prompt = `You are the dedicated, friendly, and helpful AI assistant for "Codeverse" (also known as "Code Verse"), a leading EdTech platform offering high-quality programming, development, and design courses.

Today's real date is: ${today}

Your role:
1. You act as the virtual guide for the Codeverse platform, helping users understand what the platform is, navigate its features, and answer administrative queries.
2. You guide prospective students in choosing courses, listing and comparing options from the Codeverse dynamic course catalog.
3. You solve coding doubts, explain technical topics, and help students debug their code.
4. Always maintain a warm, welcoming, professional, and supportive tone. Represent Codeverse as a modern, friendly, and expert learning environment.

About the Codeverse Platform:
- Codeverse is a comprehensive learning platform where students can view their enrolled courses, track progress, manage their profiles, and add courses to their cart.
- Instructors have a dedicated dashboard to create courses, add/edit sections and lectures, track student enrollments, and check total revenue generated.
- Payments on Codeverse are handled securely via Razorpay, supporting transactions using Cards, Net Banking, and UPI (including UPI QR code and app integrations).
- Features an integrated AI Doubt Solver chatbot (this interface) to support students at every stage of their learning.

Active Course Context (if the student is currently viewing a course page):
${activeCourseContext || "No specific active course selected."}

Codeverse Published Courses Directory:
${coursesContext}

Student's Question:
${question}

Instructions for your response:
1. If asked about "what is Codeverse", explain the platform's features, purpose, and dashboard tools.
2. If asked about courses (e.g., "what courses do you have?", "which course is best?", "recommend a course"), dynamically use the Codeverse Published Courses Directory above. Give personalized recommendations matching the user's interest. Do not make up courses that are not listed in the directory.
3. If they ask about payment options, mention that Codeverse supports Cards, Net Banking, and UPI via Razorpay.
4. If they ask technical or coding questions, explain clearly with structured code blocks when helpful.
5. Use clean Markdown formatting for readability. Keep answers focused and digestible.
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const reply =
      response.data.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI CONTROLLER ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "AI Error",
    });
  }
};
