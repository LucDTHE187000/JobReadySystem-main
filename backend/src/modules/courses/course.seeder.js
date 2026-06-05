import { CourseModel } from "./course.model.js";

const coursesData = [
    // === IT & SOFTWARE ===
    {
        title: "Frontend Developer Interview Masterclass",
        field: "IT",
        description: "Làm chủ các câu hỏi phỏng vấn hóc búa nhất về React, Javascript ES6+, CSS Grid/Flexbox và tối ưu hóa hiệu năng website. Khóa học được thiết kế đặc biệt giúp bạn tự tin chinh phục các vị trí Senior Frontend.",
        level: "Intermediate",
        instructor: {
            name: "Lâm Trí Nghĩa",
            title: "Staff Frontend Engineer tại JobReady",
            avatar: "/uploads/avatars/instructor-nghia.jpg"
        },
        thumbnail: "from-[#0A2463] to-[#247BA0]",
        duration: "3 giờ 45 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Javascript Core: closures, event loop, và prototype",
                description: "Hiểu sâu về cơ chế hoạt động bên dưới của Javascript để giải quyết các câu hỏi hóc búa.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/8aGhZQkoFbQ",
                content: "Event Loop là cơ chế giúp JavaScript thực hiện các tác vụ bất đồng bộ mặc dù nó là ngôn ngữ đơn luồng. Closures xảy ra khi một hàm ghi nhớ phạm vi từ vựng của nó ngay cả khi nó được thực thi bên ngoài phạm vi đó.",
                order: 1
            },
            {
                title: "React Lifecycle & React Hooks Deep Dive",
                description: "Cách tối ưu hóa render với useMemo, useCallback, useRef và viết Custom Hooks.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/DpLkwE40G-M",
                content: "React Hooks cho phép sử dụng state và các tính năng khác của React mà không cần viết class. Cần lưu ý tối ưu hóa hiệu năng tránh re-render không đáng có.",
                order: 2
            },
            {
                title: "CSS Layouts & Responsive Design nâng cao",
                description: "Bí quyết dàn trang phức tạp với Flexbox, CSS Grid và nguyên lý Mobile First.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/jV8BXP4nGym",
                content: "CSS Grid giúp thiết kế bố cục hai chiều trong khi Flexbox lý tưởng cho bố cục một chiều. Kết hợp linh hoạt hai công cụ này mang lại layouts linh động nhất.",
                order: 3
            },
            {
                title: "Web Performance: Core Web Vitals",
                description: "Tối ưu hóa chỉ số LCP, FID, CLS giúp trang web tải siêu nhanh.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/0fONene3OIA",
                content: "Core Web Vitals là các tiêu chuẩn đo lường trải nghiệm người dùng thực tế trên website do Google đề xuất, bao gồm tốc độ tải, khả năng tương tác và độ ổn định hình ảnh.",
                order: 4
            },
            {
                title: "Mock Interview: Phỏng vấn thử Frontend Dev",
                description: "Phân tích các câu hỏi tình huống thực tế và cách trả lời ghi điểm.",
                duration: "55:00",
                videoUrl: "https://www.youtube.com/embed/3v83L1PioqI",
                content: "Khi phỏng vấn, hãy luôn đặt câu hỏi làm rõ yêu cầu trước khi bắt tay vào code. Giải thích tư duy của bạn trong khi viết mã.",
                order: 5
            }
        ]
    },
    {
        title: "Backend & System Design Essentials",
        field: "IT",
        description: "Học cách thiết kế hệ thống lớn có khả năng chịu tải cao, thiết kế RESTful API chuẩn hóa, cơ chế caching với Redis và quản trị CSDL SQL/NoSQL.",
        level: "Advanced",
        instructor: {
            name: "Nguyễn Văn Hùng",
            title: "Solutions Architect tại TechCorp",
            avatar: "/uploads/avatars/instructor-hung.jpg"
        },
        thumbnail: "from-[#1A2E40] to-[#3A7CA5]",
        duration: "4 giờ 15 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Quy chuẩn thiết kế RESTful API & Error Handling",
                description: "Cách xây dựng các API rõ ràng, dễ mở rộng và bảo mật cao.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/lsMQRaeKNDk",
                content: "API RESTful nên sử dụng danh từ thay vì động từ cho tài nguyên và sử dụng các phương thức HTTP thích hợp như GET, POST, PUT, DELETE để thực hiện thao tác.",
                order: 1
            },
            {
                title: "Database Scaling: Replication vs Sharding",
                description: "Giải pháp lưu trữ cho hàng triệu bản ghi và phân chia dữ liệu.",
                duration: "55:00",
                videoUrl: "https://www.youtube.com/embed/5bId3DFV5ZA",
                content: "Replication sao chép dữ liệu trên nhiều máy chủ để đọc tải, trong khi Sharding chia nhỏ database thành các phần nhỏ hơn lưu trữ độc lập để tăng hiệu năng ghi.",
                order: 2
            },
            {
                title: "Cơ chế Caching với Redis nâng cao",
                description: "Chiến lược cache aside, write through và phòng chống Cache Stampede.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/G1y_B4y22h0",
                content: "Redis lưu trữ dữ liệu dạng key-value trong RAM để truy xuất tức thì. Sử dụng TTL thích hợp là tối quan trọng để giải quyết vấn đề dữ liệu bị outdate.",
                order: 3
            },
            {
                title: "Message Queue và bất đồng bộ với RabbitMQ/Kafka",
                description: "Xử lý các tác vụ nặng ngầm và giảm tải cho API chính.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/oUJbuFMyBDk",
                content: "Hệ thống hàng đợi tin nhắn giúp liên lạc bất đồng bộ giữa các microservices, nâng cao tính chịu lỗi và khả năng tự co giãn của toàn hệ thống.",
                order: 4
            },
            {
                title: "Phỏng vấn thiết kế hệ thống (System Design Mock)",
                description: "Từng bước thiết kế ứng dụng chat như Telegram hoặc hệ thống như Uber.",
                duration: "60:00",
                videoUrl: "https://www.youtube.com/embed/Km5sSbgipE0",
                content: "Luôn bắt đầu từ việc làm rõ các Functional và Non-functional requirements, tính toán dung lượng trước khi đề xuất sơ đồ kiến trúc tổng quan.",
                order: 5
            }
        ]
    },
    {
        title: "Git & Team Collaboration Essentials",
        field: "IT",
        description: "Khóa học giúp bạn nắm chắc Git flow chuyên nghiệp, giải quyết conflicts phức tạp và nâng cao chất lượng code thông qua quá trình Code Review hiệu quả.",
        level: "Beginner",
        instructor: {
            name: "Trần Minh Hoàng",
            title: "DevOps Engineer tại VNG",
            avatar: "/uploads/avatars/instructor-hoang.jpg"
        },
        thumbnail: "from-[#F25C54] to-[#F48A64]",
        duration: "2 giờ 30 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Làm chủ Git basic: commit, branch, merge",
                description: "Quản lý phiên bản mã nguồn của dự án một cách an toàn và khoa học.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/apGV9Ad7XYY",
                content: "Mỗi commit nên đại diện cho một thay đổi đơn lẻ và có message mô tả rõ ràng. Luôn tạo branch mới khi bắt đầu làm một tính năng mới.",
                order: 1
            },
            {
                title: "Giải quyết Merge Conflicts từ đơn giản đến phức tạp",
                description: "Hiểu bản chất của conflict và cách xử lý xung đột code mà không mất dữ liệu.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/hSpP1V2WqZ0",
                content: "Merge conflict xảy ra khi hai thay đổi cùng tác động lên một dòng code. Sử dụng công cụ so sánh (VS Code) và làm việc trực tiếp với đồng nghiệp để thống nhất.",
                order: 2
            },
            {
                title: "Git Flow & Pull Request chuyên nghiệp",
                description: "Mô hình phân nhánh chuẩn quốc tế cho dự án phần mềm lớn.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/aFnGPBnkxEE",
                content: "Git Flow sử dụng các nhánh main, develop, feature, release và hotfix để tách biệt rõ ràng môi trường phát triển và môi trường production.",
                order: 3
            },
            {
                title: "Quy trình Code Review chất lượng",
                description: "Cách đọc mã nguồn của đồng nghiệp, để lại nhận xét văn minh và cải thiện codebase.",
                duration: "25:00",
                videoUrl: "https://www.youtube.com/embed/as0G24eW1aA",
                content: "Mục tiêu của code review là học hỏi lẫn nhau và nâng cao chất lượng mã nguồn, không phải là chỉ trích cá nhân. Đưa ra các gợi ý mang tính xây dựng.",
                order: 4
            },
            {
                title: "CI/CD căn bản dành cho lập trình viên",
                description: "Tích hợp công cụ tự động hóa kiểm thử và kiểm tra định dạng code trước khi merge.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/62N8Ui3MSt8",
                content: "CI/CD tự động hóa quá trình build, test và deploy phần mềm, giúp giảm thiểu sai sót thủ công và tăng tốc độ đưa sản phẩm ra thị trường.",
                order: 5
            }
        ]
    },
    {
        title: "Algorithm & Data Structure Prep",
        field: "IT",
        description: "Chuẩn bị tốt nhất cho các kỳ thi thuật toán của Google, VinGroup hay FPT. Học từ các cấu trúc dữ liệu cơ bản như Mảng, Danh sách liên kết đến Đồ thị và Quy hoạch động.",
        level: "Intermediate",
        instructor: {
            name: "Phạm Anh Đức",
            title: "Competitive Programmer, cựu Kỹ sư Shopee",
            avatar: "/uploads/avatars/instructor-duc.jpg"
        },
        thumbnail: "from-[#38B000] to-[#007200]",
        duration: "5 giờ 00 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Time Complexity & Space Complexity (Big O)",
                description: "Đánh giá hiệu năng và tài nguyên sử dụng của thuật toán.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/V6mKVRU1evU",
                content: "Độ phức tạp thời gian Big O thể hiện sự tăng trưởng thời gian chạy khi kích thước đầu vào tăng lên. Cố gắng đạt hiệu năng tốt hơn O(N^2).",
                order: 1
            },
            {
                title: "Mảng & Hai Con Trỏ (Array & Two Pointers)",
                description: "Các kỹ thuật tối ưu hóa tìm kiếm và sắp xếp trên mảng một chiều.",
                duration: "55:00",
                videoUrl: "https://www.youtube.com/embed/9wX90965MKI",
                content: "Kỹ thuật Two Pointers thường dùng trên mảng đã sắp xếp để tìm kiếm cặp phần tử thỏa mãn điều kiện với độ phức tạp tuyến tính O(N).",
                order: 2
            },
            {
                title: "Stack, Queue & Hash Table căn bản",
                description: "Hiểu sâu cấu trúc dữ liệu lưu trữ và truy vấn O(1).",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/WJ_p-0c7f_s",
                content: "Stack hoạt động theo LIFO (Last In First Out), Queue theo FIFO (First In First Out), Hash Table cho phép ánh xạ khóa-giá trị siêu nhanh.",
                order: 3
            },
            {
                title: "Tìm kiếm đồ thị: BFS và DFS",
                description: "Duyệt các cấu trúc dữ liệu dạng cây và đồ thị phức tạp.",
                duration: "65:00",
                videoUrl: "https://www.youtube.com/embed/pcKY4hjDrxk",
                content: "BFS duyệt theo chiều rộng phù hợp tìm đường đi ngắn nhất không trọng số, DFS duyệt theo chiều sâu phù hợp tìm kiếm các nhánh khả thi.",
                order: 4
            },
            {
                title: "Nhập môn Quy hoạch động (Dynamic Programming)",
                description: "Chia nhỏ bài toán lớn và lưu trữ kết quả trung gian để tránh tính toán trùng lặp.",
                duration: "85:00",
                videoUrl: "https://www.youtube.com/embed/oBt53YbR9K0",
                content: "Quy hoạch động đòi hỏi tìm ra công thức truy hồi và thiết lập bảng nhớ (memoization hoặc tabulation) để tối ưu hóa thời gian chạy từ mũ sang đa thức.",
                order: 5
            }
        ]
    },
    {
        title: "UI/UX Basics for Frontend Devs",
        field: "IT",
        description: "Cầu nối giữa Lập trình và Thiết kế. Hiểu các nguyên lý UI/UX quan trọng, cách sử dụng Figma cơ bản và tạo ra các giao diện thân thiện với người dùng nhất.",
        level: "Beginner",
        instructor: {
            name: "Lê Mỹ Linh",
            title: "Product Designer tại Momo",
            avatar: "/uploads/avatars/instructor-linh.jpg"
        },
        thumbnail: "from-[#FF007F] to-[#7F00FF]",
        duration: "3 giờ 10 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Nguyên lý thiết kế: Tương phản, Cân bằng & Phân cấp thị giác",
                description: "Giúp người dùng dễ dàng nắm bắt thông tin quan trọng trên trang web.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/YI4W2TNOq4w",
                content: "Phân cấp thị giác (Visual Hierarchy) hướng mắt người dùng đến các yếu tố quan trọng nhất bằng cách sử dụng kích thước, màu sắc và khoảng trắng hợp lý.",
                order: 1
            },
            {
                title: "Học Figma cơ bản: Đọc file thiết kế và lấy Specs",
                description: "Kỹ năng cần thiết giúp Frontend Developer chuyển dịch thiết kế sang CSS chính xác 100%.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/gSndk_ZtOFA",
                content: "Tìm hiểu chế độ Dev Mode trong Figma để trích xuất màu sắc, khoảng cách, font-size và export các file ảnh/icon dễ dàng.",
                order: 2
            },
            {
                title: "Typography & Color Theory trong giao diện Web",
                description: "Cách phối màu thông minh và chọn lựa font chữ nâng tầm thẩm mỹ sản phẩm.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/bXvN_E8T1tI",
                content: "Sử dụng tỉ lệ phối màu 60-30-10: 60% màu nền chính, 30% màu bổ trợ cấu trúc, 10% màu nhấn (Accent color) cho nút hoặc CTA.",
                order: 3
            },
            {
                title: "Xây dựng Design System đồng bộ",
                description: "Thiết lập các Component thống nhất giúp tăng tốc độ thiết kế và lập trình.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/5a2d82946c",
                content: "Design System bao gồm UI Kit, Typography, Grid guidelines và các quy chuẩn code giúp đảm bảo sự đồng bộ trên toàn ứng dụng.",
                order: 4
            },
            {
                title: "Kiểm thử trải nghiệm người dùng (Usability Testing)",
                description: "Nhận phản hồi thực tế từ người dùng để cải thiện giao diện liên tục.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/asdfasdfasd",
                content: "Usability Testing giúp phát hiện các điểm nghẽn trải nghiệm bằng cách quan sát người dùng thật thực hiện các tác vụ trên sản phẩm.",
                order: 5
            }
        ]
    },

    // === SALES ===
    {
        title: "Advanced B2B Negotiation Techniques",
        field: "Sales",
        description: "Phương pháp đàm phán hợp đồng thương mại lớn với đối tác doanh nghiệp. Cách xử lý phản đối, thiết lập kịch bản win-win và chốt deal hiệu quả.",
        level: "Advanced",
        instructor: {
            name: "Trần Anh Tuấn",
            title: "Sales Director tại GlobalCorp",
            avatar: "/uploads/avatars/instructor-tuan.jpg"
        },
        thumbnail: "from-[#F77F00] to-[#D62828]",
        duration: "4 giờ 00 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Nghiên cứu đối tác & Chuẩn bị phương án BATNA",
                description: "Đặt nền móng trước khi bước vào bàn đàm phán.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "BATNA (Best Alternative to a Negotiated Agreement) là phương án thay thế tốt nhất của bạn nếu cuộc đàm phán hiện tại đổ vỡ. Giúp bạn tự tin giữ lập trường vững chắc.",
                order: 1
            },
            {
                title: "Kỹ thuật lắng nghe chủ động & Đặt câu hỏi khai thác nhu cầu",
                description: "Khai thác sâu thông tin ẩn của đối tác doanh nghiệp.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Hãy dành 70% thời gian để lắng nghe và 30% để đặt câu hỏi. Các câu hỏi mở giúp đối tác chia sẻ nhiều hơn về các vấn đề họ đang gặp phải.",
                order: 2
            },
            {
                title: "Xử lý phản đối về giá và chính sách",
                description: "Biến phản đối của khách hàng thành cơ hội làm nổi bật giá trị.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Khi khách hàng chê đắt, đừng giảm giá ngay lập tức. Hãy chứng minh giá trị ROI vượt trội mà sản phẩm của bạn đem lại.",
                order: 3
            },
            {
                title: "Chiến thuật tạo giải pháp Win-Win",
                description: "Đạt thỏa thuận lâu dài mà không cần hy sinh quá nhiều lợi ích của doanh nghiệp.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Đàm phán win-win tập trung vào lợi ích cốt lõi của hai bên, tìm kiếm các giá trị gia tăng khác thay vì chỉ tập trung chia sẻ chiếc bánh giá cả.",
                order: 4
            },
            {
                title: "Nghệ thuật chốt hợp đồng B2B",
                description: "Cách đưa cuộc đàm phán đi đến quyết định ký kết hợp đồng chính thức.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tóm tắt các điểm thống nhất và đưa ra lộ trình triển khai chi tiết rõ ràng là phương pháp hiệu quả nhất để thúc đẩy ký kết.",
                order: 5
            }
        ]
    },
    {
        title: "Cold Calling & Lead Generation",
        field: "Sales",
        description: "Khóa học thực chiến giúp bạn vượt qua nỗi sợ gọi điện, xây dựng kịch bản Telesales chinh phục khách hàng ngay từ 10 giây đầu tiên.",
        level: "Beginner",
        instructor: {
            name: "Nguyễn Hương Giang",
            title: "Telesales Manager tại VNPT",
            avatar: "/uploads/avatars/instructor-giang.jpg"
        },
        thumbnail: "from-[#F3C68F] to-[#E38B29]",
        duration: "2 giờ 50 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Vượt qua rào cản tâm lý khi gọi điện lạnh",
                description: "Chuẩn bị năng lượng tích cực trước khi bấm số.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Từ chối là một phần tất yếu của công việc Sales. Coi mỗi lời từ chối là một bước đệm tiến gần hơn tới khách hàng đồng ý tiếp theo.",
                order: 1
            },
            {
                title: "Thiết kế kịch bản mở đầu thu hút trong 10 giây",
                description: "Tạo ấn tượng chuyên nghiệp và giữ chân khách hàng trên điện thoại.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Mở đầu cuộc gọi bằng việc giới thiệu tên ngắn gọn và đưa ra ngay giá trị cốt lõi nhất đối với doanh nghiệp của họ thay vì giới thiệu lan man về công ty mình.",
                order: 2
            },
            {
                title: "Xử lý phản đối nhanh trên điện thoại",
                description: "Cách phản ứng thông minh khi khách hàng nói 'bận' hoặc 'không nhu cầu'.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Khi khách hàng nói bận, hãy đề xuất lịch hẹn cụ thể trong 2-3 ngày tới thay vì cúp máy chịu thua.",
                order: 3
            },
            {
                title: "Chuyển đổi từ Cuộc gọi sang Lịch hẹn gặp trực tiếp",
                description: "Mục tiêu tối thượng của Cold Calling.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Không bán sản phẩm trực tiếp qua điện thoại lạnh. Hãy bán một cuộc hẹn 15 phút để thảo luận sâu hơn về cơ hội hợp tác.",
                order: 4
            },
            {
                title: "Ghi nhật ký cuộc gọi & Quản lý Leads qua CRM",
                description: "Theo dõi chặt chẽ và không bỏ sót khách hàng tiềm năng.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Luôn cập nhật thông tin và đặt lịch nhắc nhở chăm sóc lại khách hàng ngay sau mỗi cuộc gọi vào hệ thống CRM.",
                order: 5
            }
        ]
    },
    {
        title: "Key Account Management Masterclass",
        field: "Sales",
        description: "Phương pháp quản lý và tối đa hóa giá trị từ các khách hàng lớn cốt lõi của doanh nghiệp. Tăng trưởng doanh thu thông qua Upselling và Cross-selling.",
        level: "Advanced",
        instructor: {
            name: "Phạm Minh Trí",
            title: "Head of Enterprise Sales tại FPT",
            avatar: "/uploads/avatars/instructor-tri.jpg"
        },
        thumbnail: "from-[#2A9D8F] to-[#264653]",
        duration: "3 giờ 30 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Nhận diện và Phân loại Khách hàng trọng điểm (KAM)",
                description: "Tiêu chí đánh giá khách hàng đem lại 80% doanh thu.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Không phải mọi khách hàng lớn đều là Key Account. Hãy phân tích dựa trên tiềm năng tăng trưởng lâu dài và mức độ phù hợp chiến lược.",
                order: 1
            },
            {
                title: "Thiết kế kế hoạch phát triển tài khoản khách hàng (Account Plan)",
                description: "Kế hoạch hành động 1 năm để củng cố mối quan hệ.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Một Account Plan hoàn chỉnh phải nêu rõ mục tiêu doanh thu, mối quan hệ chính cần xây dựng và các rủi ro có thể xảy ra.",
                order: 2
            },
            {
                title: "Xây dựng mối quan hệ đối tác chiến lược đa tầng",
                description: "Kết nối sâu rộng với các cấp quản lý và lãnh đạo của đối tác.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Đừng chỉ làm việc với một đầu mối liên hệ duy nhất. Hãy xây dựng mạng lưới quan hệ từ cấp nhân viên vận hành đến cấp CXO.",
                order: 3
            },
            {
                title: "Chiến lược Upselling và Cross-selling bền vững",
                description: "Gợi ý giải pháp mới gia tăng giá trị cho khách hàng hiện tại.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Upselling thành công khi bạn hiểu rõ nỗi đau mới phát sinh của khách hàng và đề xuất gói giải pháp phù hợp giải quyết triệt để vấn đề đó.",
                order: 4
            },
            {
                title: "Đo lường sự hài lòng & Đảm bảo giữ chân khách hàng lâu dài",
                description: "Chỉ số Net Promoter Score (NPS) và chăm sóc khách hàng đỉnh cao.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Duy trì lịch họp đánh giá hiệu quả định kỳ là chìa khóa để giữ chân khách hàng trước các đối thủ cạnh tranh khác.",
                order: 5
            }
        ]
    },
    {
        title: "Closing Sales in Retail & Showrooms",
        field: "Sales",
        description: "Kỹ năng tư vấn bán lẻ trực tiếp tại cửa hàng hoặc showroom. Thấu hiểu tâm lý khách hàng vãng lai và nghệ thuật chốt sales nhanh.",
        level: "Beginner",
        instructor: {
            name: "Vũ Thị Mai",
            title: "Showroom Manager tại VinFast",
            avatar: "/uploads/avatars/instructor-mai.jpg"
        },
        thumbnail: "from-[#FFB703] to-[#FB8500]",
        duration: "2 giờ 40 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Nghệ thuật chào đón và Tạo thiện cảm ban đầu",
                description: "Phá băng khoảng cách với khách hàng bước vào cửa hàng.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Sử dụng quy tắc nụ cười 3 giây và câu chào thân thiện, tạo không gian thoải mái cho khách hàng tự do quan sát trước khi tiếp cận tư vấn.",
                order: 1
            },
            {
                title: "Quan sát hành vi & Xác định nhóm tính cách khách hàng",
                description: "Nhận biết khách hàng muốn mua hàng nhanh hay cần tư vấn kỹ.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Khách hàng quyết đoán thường tập trung thẳng vào tính năng và thông số, trong khi khách hàng hướng nội cần sự ấm áp và trải nghiệm thực tế.",
                order: 2
            },
            {
                title: "Trình diễn sản phẩm (Demo) thuyết phục khách hàng",
                description: "Làm nổi bật các ưu điểm vượt trội thông qua trải nghiệm trực quan.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Hãy để khách hàng trực tiếp sờ, thử hoặc trải nghiệm sản phẩm. Trải nghiệm trực tiếp tăng tỉ lệ chốt đơn lên gấp 3 lần.",
                order: 3
            },
            {
                title: "Nghệ thuật xử lý phản đối trực tiếp",
                description: "Giải tỏa các lo ngại về bảo hành, chất lượng và xuất xứ.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Luôn đồng cảm với lo lắng của khách hàng trước khi đưa ra các bằng chứng, cam kết chính hãng từ thương hiệu.",
                order: 4
            },
            {
                title: "Kỹ thuật chốt sales bán lẻ tinh tế",
                description: "Sử dụng ưu đãi giới hạn thời gian để thúc đẩy quyết định mua hàng ngay.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Đề xuất lựa chọn A hoặc B (VD: Anh/chị lấy màu đỏ hay xanh?) thay vì hỏi khách hàng có mua hay không.",
                order: 5
            }
        ]
    },
    {
        title: "E-commerce Strategy & Sales Funnels",
        field: "Sales",
        description: "Phương pháp xây dựng phễu bán hàng online, tối ưu tỷ lệ chuyển đổi (CR) trên website thương mại điện tử và các sàn Shopee, Lazada, TikTok Shop.",
        level: "Intermediate",
        instructor: {
            name: "Đỗ Minh Quân",
            title: "E-commerce Consultant",
            avatar: "/uploads/avatars/instructor-quan.jpg"
        },
        thumbnail: "from-[#48CAE4] to-[#0077B6]",
        duration: "3 giờ 15 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Thiết lập phễu bán hàng E-commerce tổng quan",
                description: "Từ giai đoạn nhận biết thương hiệu đến khi khách hàng hoàn tất thanh toán.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Phễu E-commerce bao gồm: Traffic -> Thêm vào giỏ hàng -> Thanh toán -> Chăm sóc sau mua. Tối ưu từng bước là chìa khóa tăng doanh số.",
                order: 1
            },
            {
                title: "Tối ưu hóa trang sản phẩm (Product Detail Page) để tăng CR",
                description: "Cách trình bày hình ảnh, tiêu đề, mô tả sản phẩm và đánh giá thu hút nhất.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Hình ảnh rõ nét, feedback tích cực hiển thị ở trang đầu và nút đặt hàng nổi bật giúp khách hàng ra quyết định nhanh chóng.",
                order: 2
            },
            {
                title: "Chiến dịch săn Sale & Flash Sale hiệu quả",
                description: "Tạo sự khan hiếm và đẩy nhanh doanh số trong thời gian ngắn.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Chuẩn bị kỹ lưỡng nguồn hàng và ngân sách quảng cáo trước các ngày đôi lớn (9/9, 11/11...) để bùng nổ đơn hàng.",
                order: 3
            },
            {
                title: "Tối ưu hóa giỏ hàng bị bỏ rơi (Cart Abandonment)",
                description: "Chiến dịch email và tin nhắn nhắc nhở khách hàng chưa hoàn tất thanh toán.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tự động gửi mã giảm giá nhẹ hoặc miễn phí vận chuyển sau 1 giờ khách hàng bỏ giỏ hàng để kéo họ quay lại.",
                order: 4
            },
            {
                title: "Vận hành Livestream bán hàng chuyên nghiệp",
                description: "Xây dựng kịch bản livestream, quản lý deal hời và chốt đơn trực tiếp.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tương tác liên tục với người xem, tung mã giảm giá độc quyền trên live và tạo cảm giác cấp bách để chốt đơn ngay lập tức.",
                order: 5
            }
        ]
    },

    // === MARKETING ===
    {
        title: "SEO Masterclass: Lên Top Google Bền Vững",
        field: "Marketing",
        description: "Lộ trình đào tạo SEO bài bản từ nghiên cứu từ khóa, tối ưu SEO Onpage, viết bài chuẩn SEO, đến xây dựng Entity và tối ưu Technical SEO.",
        level: "Intermediate",
        instructor: {
            name: "Hoàng Minh Long",
            title: "SEO Manager tại SEOAgency",
            avatar: "/uploads/avatars/instructor-long.jpg"
        },
        thumbnail: "from-[#833AB4] to-[#FD1D1D]",
        duration: "4 giờ 30 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Nghiên cứu từ khóa cốt lõi (Keyword Research)",
                description: "Tìm kiếm từ khóa mang lại chuyển đổi cao và ít cạnh tranh.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Sử dụng công cụ Ahrefs hoặc Google Keyword Planner để tìm kiếm các từ khóa ngách dài (Long-tail keywords) có mục đích tìm kiếm rõ ràng.",
                order: 1
            },
            {
                title: "Tối ưu hóa SEO Onpage tiêu chuẩn 2026",
                description: "Cách cấu trúc URL, thẻ Title, Meta Description và Heading hoàn hảo.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Từ khóa chính nên xuất hiện trong 100 từ đầu tiên, thẻ Title, URL và thẻ Alt của hình ảnh để Google bot dễ dàng hiểu chủ đề bài viết.",
                order: 2
            },
            {
                title: "Nghệ thuật viết bài chuẩn SEO (SEO Copywriting)",
                description: "Tạo nội dung giá trị cho người đọc và thân thiện với thuật toán tìm kiếm.",
                duration: "55:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Viết bài giải quyết trọn vẹn thắc mắc của người dùng. Tránh nhồi nhét từ khóa thái quá ảnh hưởng tiêu cực đến trải nghiệm đọc.",
                order: 3
            },
            {
                title: "Technical SEO: Tốc độ tải trang và Mobile Usability",
                description: "Đảm bảo website vận hành trơn tru và dễ cào dữ liệu.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tối ưu hóa file sitemap.xml, robots.txt và cài đặt SSL bảo mật cho trang web để đạt điểm kỹ thuật tốt nhất.",
                order: 4
            },
            {
                title: "Xây dựng liên kết ngoài (Link Building) chất lượng",
                description: "Nâng cao uy tín website (Domain Authority) thông qua Guest Posting.",
                duration: "60:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Chỉ đặt backlink từ các website uy tín cùng lĩnh vực. Tránh mua bán link rác dễ bị Google phạt thuật toán.",
                order: 5
            }
        ]
    },
    {
        title: "Performance Marketing & Digital Ads",
        field: "Marketing",
        description: "Học cách thiết lập, chạy thử nghiệm A/B và tối ưu hóa ngân sách quảng cáo trên Facebook Ads, Google Search/GDN và TikTok Ads.",
        level: "Intermediate",
        instructor: {
            name: "Nguyễn Thế Sơn",
            title: "Performance Leader tại AgencyX",
            avatar: "/uploads/avatars/instructor-son.jpg"
        },
        thumbnail: "from-[#FF4E00] to-[#EC9F05]",
        duration: "4 giờ 15 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Căn bản về các chỉ số đo lường quảng cáo (KPIs)",
                description: "Thấu hiểu CTR, CPC, CPM, CPA và cách tính ROI/ROAS.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "ROAS (Return on Ad Spend) thể hiện doanh thu thu được trên mỗi đồng chi phí quảng cáo. Cần kết hợp xem xét giá trị trọn đời của khách hàng (LTV).",
                order: 1
            },
            {
                title: "Thiết lập chiến dịch Facebook Ads chuẩn xác",
                description: "Nhắm mục tiêu (Targeting) và cấu trúc nhóm quảng cáo thông minh.",
                duration: "55:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tạo các tệp đối tượng tùy chỉnh (Custom Audiences) và đối tượng tương tự (Lookalike Audiences) dựa trên hành vi khách hàng cũ để tối ưu chuyển đổi.",
                order: 2
            },
            {
                title: "Làm chủ Google Search Ads & Đấu thầu Từ khóa",
                description: "Đưa website xuất hiện ngay lập tức trước nhu cầu tìm kiếm của khách hàng.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Viết mẫu quảng cáo thu hút và thiết lập từ khóa phủ định để tránh lãng phí ngân sách vào các lượt click không tiềm năng.",
                order: 3
            },
            {
                title: "Bùng nổ doanh số với TikTok Ads và Video ngắn",
                description: "Cách xây dựng nội dung quảng cáo tự nhiên và thu hút người xem thế hệ Gen Z.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Quảng cáo TikTok hiệu quả nhất khi trông giống như một video thông thường của người dùng, mang tính giải trí hoặc chia sẻ mẹo vặt hữu ích.",
                order: 4
            },
            {
                title: "Thử nghiệm A/B Test & Tối ưu hóa phễu quảng cáo",
                description: "Phương pháp khoa học để tìm ra mẫu thiết kế và thông điệp hiệu quả nhất.",
                duration: "60:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Chỉ thay đổi một biến duy nhất (tiêu đề, hình ảnh hoặc nút kêu gọi hành động) trong mỗi lần thử nghiệm để có kết luận chính xác nhất.",
                order: 5
            }
        ]
    },
    {
        title: "Content Marketing Strategy",
        field: "Marketing",
        description: "Phương pháp lên chiến lược nội dung đa kênh, viết bài copywriting thôi miên khách hàng và xây dựng lịch biên tập chuyên nghiệp.",
        level: "Beginner",
        instructor: {
            name: "Phạm Hà Linh",
            title: "Content Director tại BeautyCorp",
            avatar: "/uploads/avatars/instructor-halinh.jpg"
        },
        thumbnail: "from-[#F72585] to-[#7209B7]",
        duration: "3 giờ 00 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Xác định chân dung độc giả & Định vị tiếng nói thương hiệu",
                description: "Nói ngôn ngữ của khách hàng để tạo sự đồng cảm sâu sắc.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tìm hiểu các pain points, sở thích và kênh thông tin ưa thích của khách hàng mục tiêu để xây dựng văn phong phù hợp nhất.",
                order: 1
            },
            {
                title: "Mô hình AIDA trong viết Content bán hàng",
                description: "Kỹ thuật viết bài từ gây chú ý đến thôi thúc mua hàng.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "AIDA đại diện cho Attention (Gây chú ý), Interest (Gợi thích thú), Desire (Kích thích thèm muốn) và Action (Kêu gọi hành động).",
                order: 2
            },
            {
                title: "Xây dựng lịch biên tập đa kênh (Editorial Calendar)",
                description: "Quản trị nội dung nhất quán trên Facebook, Blog và Youtube.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Phân bổ tỉ lệ nội dung: 50% chia sẻ giá trị, 30% kết nối/tương tác, 20% bán hàng trực tiếp để tránh làm người xem ngán ngẩm.",
                order: 3
            },
            {
                title: "Tái sử dụng nội dung (Content Repurposing)",
                description: "Biến một bài viết blog chuyên sâu thành hàng chục post mạng xã hội khác nhau.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Chuyển thể bài viết dài thành Infographic, video ngắn, podcast hoặc slide tài liệu giúp tiết kiệm thời gian sản xuất tối đa.",
                order: 4
            },
            {
                title: "Đo lường hiệu quả Content Marketing",
                description: "Theo dõi lượng tương tác, thời gian onsite và tỷ lệ chuyển đổi từ nội dung.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Sử dụng Google Analytics để biết bài viết nào thu hút lượng traffic lớn nhất và giữ chân độc giả lâu nhất.",
                order: 5
            }
        ]
    },
    {
        title: "Social Media Branding & Community Building",
        field: "Marketing",
        description: "Bí quyết định vị thương hiệu cá nhân hoặc doanh nghiệp trên MXH. Cách xây dựng và vận hành group cộng đồng hàng chục nghìn thành viên.",
        level: "Beginner",
        instructor: {
            name: "Đặng Tiến Dũng",
            title: "Community Manager tại TechHub",
            avatar: "/uploads/avatars/instructor-dung.jpg"
        },
        thumbnail: "from-[#4EA8DE] to-[#5390D9]",
        duration: "3.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Chọn kênh truyền thông xã hội phù hợp mục tiêu",
                description: "Phân biệt nhóm người dùng trên Facebook, LinkedIn, TikTok và Instagram.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "LinkedIn phù hợp cho tuyển dụng và B2B; TikTok lý tưởng cho chiến dịch lan tỏa thương hiệu nhanh; Facebook giữ vai trò cộng đồng trung tâm.",
                order: 1
            },
            {
                title: "Thiết lập nhận diện thương hiệu nhất quán",
                description: "Quy chuẩn màu sắc, logo và thông điệp truyền tải thống nhất.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Sự đồng bộ trong hình ảnh và tiếng nói giúp thương hiệu dễ dàng được nhận diện và khắc sâu trong tâm trí khách hàng.",
                order: 2
            },
            {
                title: "Quy trình xây dựng Group Cộng đồng từ con số 0",
                description: "Thu hút 10,000 thành viên đầu tiên chất lượng.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tập trung tạo ra các thảo luận chất lượng, giải đáp thắc mắc chuyên môn và chia sẻ tài liệu độc quyền để kích thích người dùng tham gia.",
                order: 3
            },
            {
                title: "Quản trị khủng hoảng truyền thông MXH",
                description: "Nhận diện dấu hiệu và quy trình xử lý khủng hoảng truyền thông êm đẹp.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Lắng nghe phản hồi chân thành, phản ứng nhanh chóng và trung thực là chìa khóa vàng xoa dịu dư luận.",
                order: 4
            },
            {
                title: "Đo lường chỉ số tương tác & Tình trạng cộng đồng",
                description: "Sử dụng Group Insights để theo dõi mức độ gắn kết của thành viên.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Theo dõi số lượng bài viết mới mỗi ngày, tỉ lệ thành viên tương tác chủ động để điều chỉnh định hướng nội dung kịp thời.",
                order: 5
            }
        ]
    },
    {
        title: "Email Marketing Automation",
        field: "Marketing",
        description: "Xây dựng tệp email chất lượng, viết tiêu đề email có tỷ lệ mở (Open Rate) cao và thiết kế kịch bản nuôi dưỡng khách hàng tự động.",
        level: "Intermediate",
        instructor: {
            name: "Trịnh Thùy Linh",
            title: "CRM Specialist tại RetailCo",
            avatar: "/uploads/avatars/instructor-thuylinh.jpg"
        },
        thumbnail: "from-[#9B5DE5] to-[#F15BB5]",
        duration: "3 giờ 10 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Xây dựng danh sách Email đăng ký tự nguyện (Opt-in List)",
                description: "Cách tặng quà tài liệu (Lead Magnet) để thu thập email chất lượng.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tạo các trang Landing page đơn giản với mẫu đăng ký nhận tài nguyên miễn phí như Ebook, Webinar hoặc mã giảm giá độc quyền.",
                order: 1
            },
            {
                title: "Nghệ thuật viết tiêu đề Email lôi cuốn",
                description: "Đánh trúng tâm lý tò mò giúp tỷ lệ mở email đạt trên 25%.",
                duration: "35:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tiêu đề nên ngắn gọn dưới 50 ký tự, mang tính cá nhân hóa (chứa tên khách hàng) và tạo cảm giác tò mò hoặc cấp thiết.",
                order: 2
            },
            {
                title: "Kịch bản Email chào mừng (Welcome Series) tự động",
                description: "Tạo ấn tượng ban đầu và chuyển đổi khách hàng đăng ký mới.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Chuỗi 3 email chào mừng tự động giới thiệu thương hiệu, cung cấp tài nguyên đã hứa và chia sẻ các câu chuyện thành công tiêu biểu.",
                order: 3
            },
            {
                title: "Phân khúc danh sách Email (Segmentation)",
                description: "Gửi đúng thông điệp đến đúng nhóm đối tượng để tối ưu chuyển đổi.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Phân loại danh sách email theo hành vi mua hàng, mức độ tương tác hoặc sở thích cá nhân để gửi các chiến dịch cá nhân hóa sâu sắc.",
                order: 4
            },
            {
                title: "Đo lường chỉ số Click-through Rate & Hạn chế Spam",
                description: "Các kỹ thuật cải thiện độ uy tín của tên miền gửi email.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Cấu trúc email sạch, hạn chế từ ngữ kích hoạt bộ lọc spam và định kỳ lọc bỏ các địa chỉ email không hoạt động lâu ngày.",
                order: 5
            }
        ]
    },

    // === FINANCE ===
    {
        title: "Corporate Finance Analysis",
        field: "Finance",
        description: "Phân tích sức khỏe tài chính doanh nghiệp thông qua bảng cân đối kế toán, báo cáo kết quả kinh doanh và báo cáo lưu chuyển tiền tệ.",
        level: "Intermediate",
        instructor: {
            name: "Vũ Minh Trí",
            title: "Financial Analyst tại VinGroup",
            avatar: "/uploads/avatars/instructor-minhtri.jpg"
        },
        thumbnail: "from-[#3D5A80] to-[#98C1D9]",
        duration: "4 giờ 00 phút",
        lessonsCount: 5,
        lessons: [
            {
                title: "Đọc hiểu Bảng Cân Đối Kế Toán nhanh chóng",
                description: "Nhận biết tài sản ngắn hạn, dài hạn và nợ phải trả.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Bảng cân đối kế toán thể hiện phương trình: Tài sản = Nợ phải trả + Vốn chủ sở hữu tại một thời điểm cụ thể.",
                order: 1
            },
            {
                title: "Phân tích Báo cáo Kết quả Kinh doanh (P&L)",
                description: "Đánh giá doanh thu, giá vốn bán hàng và biên lợi nhuận gộp.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Báo cáo P&L thể hiện hoạt động kinh doanh của doanh nghiệp qua một thời kỳ, chỉ ra khả năng sinh lời thực sự.",
                order: 2
            },
            {
                title: "Bản chất của Báo cáo Lưu Chuyển Tiền Tệ (Cash Flow)",
                description: "Dòng tiền từ hoạt động kinh doanh, đầu tư và tài chính.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Lợi nhuận không phải là tiền mặt. Doanh nghiệp có thể có lãi trên sổ sách nhưng vẫn phá sản nếu mất thanh khoản dòng tiền.",
                order: 3
            },
            {
                title: "Các chỉ số tài chính quan trọng: ROE, ROA, EBITDA",
                description: "Đo lường hiệu quả hoạt động kinh doanh.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "ROE (Return on Equity) đo lường khả năng sinh lời trên nguồn vốn cổ đông đóng góp, chỉ số này tối thiểu nên đạt trên 15%.",
                order: 4
            },
            {
                title: "Đánh giá khả năng thanh toán và rủi ro nợ",
                description: "Cách sử dụng chỉ số thanh toán hiện thời và thanh toán nhanh.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Chỉ số thanh toán nhanh giúp đánh giá khả năng hoàn trả các khoản nợ ngắn hạn bằng tài sản có tính thanh khoản cao nhất.",
                order: 5
            }
        ]
    },
    {
        title: "Financial Modeling in Excel",
        field: "Finance",
        description: "Học cách thiết lập mô hình tài chính chuyên nghiệp từ dự phóng doanh thu, chi phí đến phân tích độ nhạy của dự án đầu tư.",
        level: "Advanced",
        instructor: {
            name: "Trần Thu Hà",
            title: "CFO tại TechInvestment",
            avatar: "/uploads/avatars/instructor-ha.jpg"
        },
        thumbnail: "from-[#1D3557] to-[#457B9D]",
        duration: "4.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Nguyên tắc thiết lập cấu trúc mô hình tài chính chuẩn",
                description: "Sắp xếp dữ liệu đầu vào (Inputs), tính toán và đầu ra (Outputs) khoa học.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Mô hình tài chính tốt phải linh hoạt, các công thức không được hard-code giá trị số để dễ dàng thay đổi kịch bản giả định.",
                order: 1
            },
            {
                title: "Kỹ thuật dự phóng Doanh thu & Chi phí tương lai",
                description: "Thiết lập các biến số tăng trưởng dựa trên dữ liệu lịch sử và nghiên cứu thị trường.",
                duration: "55:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Sử dụng các phương pháp tuyến tính hoặc phi tuyến tính kết hợp các kịch bản Tốt/Bình thường/Xấu để có tầm nhìn dự báo đa chiều.",
                order: 2
            },
            {
                title: "Xây dựng lịch khấu hao và nợ vay liên kết",
                description: "Công thức liên kết tự động bảng cân đối và dòng tiền.",
                duration: "50:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Khấu hao tài sản cố định (CAPEX) và thanh toán nợ vay ảnh hưởng trực tiếp đến dòng tiền tự do (FCFF) của doanh nghiệp.",
                order: 3
            },
            {
                title: "Tính toán chỉ số NPV, IRR và thời gian hoàn vốn",
                description: "Đánh giá hiệu quả kinh tế của dự án trước khi xuống tiền đầu tư.",
                duration: "55:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "NPV (Net Present Value) dương chứng tỏ dự án sinh lời lớn hơn chi phí cơ hội của dòng vốn bỏ ra.",
                order: 4
            },
            {
                title: "Phân tích độ nhạy (Sensitivity Analysis) và Data Table",
                description: "Xem xét sự thay đổi của NPV/IRR khi chi phí hoặc doanh thu biến động.",
                duration: "65:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Sử dụng tính năng Data Table trong Excel để tự động hóa việc chạy các kịch bản kết hợp nhiều biến số cùng lúc.",
                order: 5
            }
        ]
    },
    {
        title: "Tax & Auditing Foundations",
        field: "Finance",
        description: "Các kiến thức thuế thu nhập doanh nghiệp, thuế GTGT cơ bản và quy trình kiểm toán nội bộ tối thiểu mọi kế toán viên cần nắm vững.",
        level: "Beginner",
        instructor: {
            name: "Lê Văn Tiến",
            title: "Auditing Partner tại Big4",
            avatar: "/uploads/avatars/instructor-tien.jpg"
        },
        thumbnail: "from-[#2B2D42] to-[#8D99AE]",
        duration: "3.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Tổng quan hệ thống thuế Việt Nam",
                description: "Phân biệt Thuế TNDN, Thuế TNCN và Thuế GTGT.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Nắm rõ thời hạn kê khai và nộp thuế định kỳ tháng, quý, quyết toán năm để tránh các khoản phạt không đáng có.",
                order: 1
            },
            {
                title: "Xác định chi phí hợp lý được trừ khi tính thuế TNDN",
                description: "Tối ưu hóa số thuế phải nộp đúng luật.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Chi phí được trừ phải có đầy đủ hóa đơn, chứng từ hợp pháp và liên quan trực tiếp đến hoạt động sản xuất kinh doanh.",
                order: 2
            },
            {
                title: "Quy trình đối chiếu chứng từ và Kê khai thuế GTGT",
                description: "Phương pháp khấu trừ thuế đầu vào và đầu ra.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Kiểm tra kỹ thông tin nhà cung cấp trên hóa đơn điện tử đầu vào trước khi tiến hành kê khai khấu trừ thuế.",
                order: 3
            },
            {
                title: "Nhập môn Kiểm toán nội bộ (Internal Audit)",
                description: "Kiểm tra tính tuân thủ và phát hiện gian lận trong doanh nghiệp.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Thiết lập chốt kiểm soát chéo giữa các phòng ban để giảm thiểu tối đa sai sót và thất thoát tài sản.",
                order: 4
            },
            {
                title: "Chuẩn bị hồ sơ đón tiếp đoàn thanh tra thuế",
                description: "Sắp xếp hệ thống chứng từ kế toán khoa học.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Hồ sơ sổ sách kế toán cần in ấn, đóng tập gọn gàng kèm theo file mềm thuyết minh chi tiết phục vụ kiểm tra.",
                order: 5
            }
        ]
    },
    {
        title: "Investment Portfolio Management",
        field: "Finance",
        description: "Phương pháp phân bổ tài sản, lựa chọn cổ phiếu theo trường phái phân tích cơ bản (FA) và quản trị rủi ro danh mục đầu tư chứng khoán.",
        level: "Intermediate",
        instructor: {
            name: "Nguyễn Minh Đức",
            title: "Portfolio Manager tại FundCorp",
            avatar: "/uploads/avatars/instructor-minhduc.jpg"
        },
        thumbnail: "from-[#003049] to-[#D62828]",
        duration: "3.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Hiểu về rủi ro và Lợi nhuận kỳ vọng",
                description: "Đo lường độ lệch chuẩn và chỉ số Beta của cổ phiếu.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Beta đo lường mức độ biến động của cổ phiếu so với thị trường chung. Beta > 1 có biên độ biến động lớn hơn thị trường.",
                order: 1
            },
            {
                title: "Lựa chọn cổ phiếu theo Phương pháp CANSLIM",
                description: "Bộ tiêu chí chọn lọc cổ phiếu tăng trưởng hàng đầu của William O'Neil.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "CANSLIM chú trọng vào tăng trưởng lợi nhuận quý hiện tại, tăng trưởng hàng năm và các yếu tố xúc tác mới từ doanh nghiệp.",
                order: 2
            },
            {
                title: "Chiến lược Phân bổ tài sản (Asset Allocation)",
                description: "Cân bằng danh mục giữa Cổ phiếu, Trái phiếu và Tiền mặt theo chu kỳ kinh tế.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Phân bổ tài sản quyết định trên 90% hiệu quả đầu tư lâu dài, thay vì việc cố gắng chọn đúng thời điểm mua bán cụ thể.",
                order: 3
            },
            {
                title: "Quản trị rủi ro & Nguyên tắc cắt lỗ (Stop-loss)",
                description: "Bảo vệ vốn đầu tư trước các biến động mạnh của thị trường.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Luôn đặt kỷ luật cắt lỗ tự động tại mức 7-8% so với giá mua để tránh các đợt giảm sâu dài hạn phá hủy tài khoản.",
                order: 4
            },
            {
                title: "Đánh giá hiệu quả danh mục: Sharpe Ratio",
                description: "Đo lường mức lợi nhuận thu được trên một đơn vị rủi ro chấp nhận.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tỷ lệ Sharpe càng cao chứng tỏ danh mục đầu tư đem lại lợi nhuận hiệu quả dựa trên mức độ rủi ro đã gánh chịu.",
                order: 5
            }
        ]
    },
    {
        title: "Personal Finance & Wealth Management",
        field: "Finance",
        description: "Lập kế hoạch tài chính cá nhân, quản lý chi tiêu hiệu quả theo quy tắc 6 chiếc hũ và phương pháp xây dựng quỹ dự phòng khẩn cấp.",
        level: "Beginner",
        instructor: {
            name: "Lâm Hải Yến",
            title: "Personal Finance Coach",
            avatar: "/uploads/avatars/instructor-yen.jpg"
        },
        thumbnail: "from-[#E07A5F] to-[#3D405B]",
        duration: "2.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Nhận thức về Tiền và Tư duy tự do tài chính",
                description: "Hiểu bản chất của tài sản, tiêu sản và các cột mốc tài chính.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tự do tài chính đạt được khi dòng tiền thu nhập thụ động từ tài sản lớn hơn tổng chi phí sinh hoạt hàng tháng của bạn.",
                order: 1
            },
            {
                title: "Quy tắc 6 chiếc hũ trong Quản lý chi tiêu",
                description: "Phương pháp phân bổ thu nhập thông minh.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Phân bổ thu nhập vào các hũ: Chi tiêu thiết yếu (55%), Tiết kiệm dài hạn (10%), Giáo dục (10%), Đầu tư tự do tài chính (10%), Hưởng thụ (10%), Từ thiện (5%).",
                order: 2
            },
            {
                title: "Thiết lập Quỹ dự phòng khẩn cấp an toàn",
                description: "Khoản bảo hiểm tâm lý trước biến cố mất việc hoặc ốm đau đột xuất.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Quỹ dự phòng khẩn cấp nên duy trì tương đương 3-6 tháng chi phí sinh hoạt thiết yếu của gia đình bạn.",
                order: 3
            },
            {
                title: "Quản lý nợ vay & Chiến lược thoát nợ thông minh",
                description: "Phương pháp Tuyết lở (Debt Avalanche) và Hòn tuyết lăn (Debt Snowball).",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Phương pháp Tuyết lở ưu tiên trả khoản nợ có lãi suất cao nhất trước để giảm tổng chi phí lãi vay phải trả.",
                order: 4
            },
            {
                title: "Lập kế hoạch hưu trí an nhàn từ sớm",
                description: "Sức mạnh của lãi kép khi đầu tư tích lũy dài hạn.",
                duration: "30:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Bắt đầu đầu tư tích lũy một khoản tiền nhỏ định kỳ từ độ tuổi 20 sẽ mang lại tài sản khổng lồ ở độ tuổi 60 nhờ lãi kép cộng dồn.",
                order: 5
            }
        ]
    },

    // === HR ===
    {
        title: "Modern Recruitment & Headhunting",
        field: "HR",
        description: "Phương pháp tìm kiếm ứng viên tài năng (Sourcing), xây dựng thương hiệu tuyển dụng (Employer Branding) và phỏng vấn đánh giá ứng viên chuyên nghiệp.",
        level: "Intermediate",
        instructor: {
            name: "Nguyễn Thị Thu Trang",
            title: "HR Director tại TechVina",
            avatar: "/uploads/avatars/instructor-trang.jpg"
        },
        thumbnail: "from-[#5E503F] to-[#0A0908]",
        duration: "3.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Thiết lập mô tả công việc (JD) thu hút hồ sơ",
                description: "Trình bày rõ ràng quyền lợi, yêu cầu và sứ mệnh công việc.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "JD không nên chỉ là danh sách yêu cầu công việc đơn điệu. Hãy nêu bật giá trị văn hóa và cơ hội học tập phát triển sự nghiệp.",
                order: 1
            },
            {
                title: "Kỹ năng tìm kiếm ứng viên thụ động (Passive Candidate Sourcing)",
                description: "Sử dụng LinkedIn Recruiter và Boolean Search nâng cao.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Sử dụng các toán tử AND, OR, NOT trong tìm kiếm để lọc chính xác các ứng viên có kỹ năng đặc thù đang không chủ động tìm việc.",
                order: 2
            },
            {
                title: "Nghệ thuật phỏng vấn theo mô hình STAR",
                description: "Đánh giá năng lực thực tế của ứng viên thông qua hành vi quá khứ.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "STAR bao gồm Situation (Tình huống), Task (Nhiệm vụ), Action (Hành động), Result (Kết quả) giúp đào sâu kinh nghiệm thực tế.",
                order: 3
            },
            {
                title: "Xây dựng thương hiệu tuyển dụng (Employer Branding)",
                description: "Đưa doanh nghiệp trở thành nơi làm việc lý tưởng trong mắt ứng viên.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Chia sẻ hình ảnh hoạt động văn hóa, câu chuyện nhân viên thực tế lên MXH để thu hút ứng viên tự nguyện nộp hồ sơ.",
                order: 4
            },
            {
                title: "Quản trị trải nghiệm ứng viên (Candidate Experience)",
                description: "Duy trì sự chuyên nghiệp từ lúc nộp hồ sơ đến khi nhận thư mời nhận việc.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Gửi phản hồi nhanh chóng, lịch sự cho cả ứng viên không đạt yêu cầu để giữ vững hình ảnh uy tín của doanh nghiệp.",
                order: 5
            }
        ]
    },
    {
        title: "Employee Engagement & Company Culture",
        field: "HR",
        description: "Phương pháp khảo sát mức độ hài lòng, thiết kế các chương trình gắn kết nội bộ và định hình văn hóa doanh nghiệp độc đáo.",
        level: "Intermediate",
        instructor: {
            name: "Lê Minh Anh",
            title: "Culture & Engagement Manager tại FPT Software",
            avatar: "/uploads/avatars/instructor-minhanh.jpg"
        },
        thumbnail: "from-[#F25C54] to-[#F48A64]",
        duration: "3.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Khảo sát chỉ số gắn kết nhân viên (eNPS)",
                description: "Cách đo lường và phân tích mức độ trung thành của nhân sự.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "eNPS khảo sát câu hỏi: Trên thang điểm 10, bạn có sẵn lòng giới thiệu công ty mình cho bạn bè ứng tuyển không? Từ đó tính toán tỷ lệ gắn kết.",
                order: 1
            },
            {
                title: "Thiết kế chương trình Teambuilding ý nghĩa",
                description: "Tránh các hoạt động khiên cưỡng, tập trung kết nối sâu sắc.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Teambuilding thành công khi tạo cơ hội cho mọi người thấu hiểu điểm mạnh của nhau và phối hợp giải quyết thử thách nhóm vui vẻ.",
                order: 2
            },
            {
                title: "Xây dựng hệ thống vinh danh & Khen thưởng (R&R)",
                description: "Động viên nhân sự cống hiến vượt trội thông qua ghi nhận kịp thời.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Thiết lập giải thưởng Nhân viên xuất sắc tháng, giải thưởng sáng kiến đột phá kèm theo phần thưởng tinh thần và vật chất ý nghĩa.",
                order: 3
            },
            {
                title: "Định hình và Truyền thông Giá trị cốt lõi",
                description: "Đưa văn hóa doanh nghiệp thấm nhuần vào hành vi hàng ngày.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Lãnh đạo làm gương là cách truyền thông văn hóa hiệu quả nhất. Tuyên dương các hành vi thực tế biểu trưng cho giá trị cốt lõi.",
                order: 4
            },
            {
                title: "Phòng ngừa và Giải quyết tình trạng kiệt sức (Burnout)",
                description: "Nhận diện sớm các dấu hiệu quá tải và giải pháp hỗ trợ tâm lý nhân viên.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Khuyến khích văn hóa cân bằng công việc - cuộc sống (WLB), thiết lập các kênh tư vấn tâm lý bảo mật cho nhân sự.",
                order: 5
            }
        ]
    },
    {
        title: "Payroll & Labor Law Basics",
        field: "HR",
        description: "Các quy định luật lao động mới nhất về hợp đồng, thời giờ làm việc, bảo hiểm xã hội và phương pháp tính lương, thuế TNCN cho nhân viên.",
        level: "Beginner",
        instructor: {
            name: "Nguyễn Thị Lan Anh",
            title: "C&B Expert",
            avatar: "/uploads/avatars/instructor-lananh.jpg"
        },
        thumbnail: "from-[#457B9D] to-[#1D3557]",
        duration: "3.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Các loại Hợp đồng lao động và quy định ký kết",
                description: "Phân biệt Hợp đồng xác định thời hạn và không xác định thời hạn.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tìm hiểu quy định thử việc tối đa 60 ngày đối với trình độ đại học trở lên và quyền lợi bảo hiểm trong thời gian thử việc.",
                order: 1
            },
            {
                title: "Phương pháp tính lương: Lương Net vs Lương Gross",
                description: "Bản chất cách tính thuế và bảo hiểm xã hội trên bảng lương.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Lương Gross là tổng thu nhập bao gồm thuế và bảo hiểm. Lương Net là số tiền thực nhận sau khi đã trừ các khoản này.",
                order: 2
            },
            {
                title: "Quy định Bảo hiểm xã hội bắt buộc",
                description: "Tỷ lệ trích đóng BHXH, BHYT, BHTN giữa doanh nghiệp và người lao động.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Người lao động đóng 10.5% thu nhập và doanh nghiệp đóng 21.5% thu nhập vào các quỹ bảo hiểm bắt buộc theo luật hiện hành.",
                order: 3
            },
            {
                title: "Tính thuế TNCN từ tiền lương, tiền công",
                description: "Cách tính giảm trừ gia cảnh và áp dụng biểu thuế lũy tiến từng phần.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Nắm vững mức giảm trừ bản thân 11 triệu đồng/tháng và mức giảm trừ người phụ thuộc 4.4 triệu đồng/tháng khi tính thuế TNCN.",
                order: 4
            },
            {
                title: "Quy trình chấm dứt HĐLĐ hợp pháp",
                description: "Quy định báo trước, trợ cấp thôi việc và bàn giao công việc.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Người lao động cần báo trước ít nhất 30 ngày (xác định thời hạn) hoặc 45 ngày (không xác định thời hạn) khi đơn phương chấm dứt hợp đồng.",
                order: 5
            }
        ]
    },
    {
        title: "Performance Appraisal Systems (KPIs & OKRs)",
        field: "HR",
        description: "Phương pháp thiết kế chỉ số hiệu suất KPI, triển khai quản trị mục tiêu OKR đồng bộ từ cấp ban giám đốc đến từng nhân viên.",
        level: "Intermediate",
        instructor: {
            name: "Đỗ Hoàng Nam",
            title: "Performance Management Consultant",
            avatar: "/uploads/avatars/instructor-nam.jpg"
        },
        thumbnail: "from-[#023E8A] to-[#0096C7]",
        duration: "3.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Bản chất sự khác biệt giữa KPI và OKR",
                description: "Khi nào doanh nghiệp nên dùng KPI và khi nào dùng OKR.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "KPI là chỉ số đo lường hiệu suất công việc hàng ngày bền vững. OKR là phương pháp quản trị mục tiêu tham vọng, thúc đẩy đột phá.",
                order: 1
            },
            {
                title: "Quy trình thiết kế chỉ số KPI theo tiêu chuẩn SMART",
                description: "Đảm bảo KPI rõ ràng, đo lường được và công bằng cho nhân sự.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "SMART: Specific (Cụ thể), Measurable (Đo lường được), Achievable (Khả thi), Relevant (Liên quan), Time-bound (Thời hạn rõ ràng).",
                order: 2
            },
            {
                title: "Viết OKR chuẩn: Objectives & Key Results",
                description: "Thiết kế mục tiêu truyền cảm hứng và kết quả then chốt định lượng rõ ràng.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Mục tiêu (O) trả lời cho câu hỏi: Chúng ta muốn đạt được cái gì? Kết quả then chốt (KRs) trả lời: Làm thế nào để biết mình đạt được?",
                order: 3
            },
            {
                title: "Họp đánh giá hiệu quả công việc (Performance Review Meeting)",
                description: "Kỹ năng phản hồi mang tính xây dựng, ghi nhận và vạch kế hoạch cải thiện.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tránh đánh giá một chiều mang tính phán xét. Hãy cùng nhân viên tìm hiểu nguyên nhân gốc rễ của việc chưa đạt mục tiêu và đưa ra giải pháp hỗ trợ.",
                order: 4
            },
            {
                title: "Liên kết kết quả đánh giá với Lương thưởng & Thăng tiến",
                description: "Thiết lập chính sách minh bạch tạo động lực cho nhân sự.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Xây dựng ma trận hiệu suất (9-box grid) để phân nhóm nhân tài, hoạch định chính sách thăng tiến và đào tạo kế thừa hợp lý.",
                order: 5
            }
        ]
    },
    {
        title: "Conflict Resolution in the Workspace",
        field: "HR",
        description: "Kỹ năng hòa giải tranh chấp, xử lý xung đột quyền lợi giữa các cá nhân/phòng ban và xây dựng bầu không khí làm việc hòa hợp.",
        level: "Intermediate",
        instructor: {
            name: "Nguyễn Lê Mai Anh",
            title: "HR Business Partner tại BigTech",
            avatar: "/uploads/avatars/instructor-maianh.jpg"
        },
        thumbnail: "from-[#1D3557] to-[#E63946]",
        duration: "3.5 hours",
        lessonsCount: 5,
        lessons: [
            {
                title: "Nhận diện các nguyên nhân gây xung đột phổ biến",
                description: "Tranh chấp tài nguyên, bất đồng tính cách hay lệch mục tiêu công việc.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Xung đột không hoàn toàn xấu. Xung đột mang tính chuyên môn giúp thúc đẩy tìm kiếm giải pháp tốt hơn, nhưng xung đột cá nhân cần triệt tiêu.",
                order: 1
            },
            {
                title: "Mô hình Thomas-Kilmann trong giải quyết xung đột",
                description: "5 phong cách phản ứng: Cạnh tranh, Hợp tác, Thỏa hiệp, Tránh né và Thích nghi.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Lựa chọn phong cách giải quyết phụ thuộc vào mức độ quan trọng của mối quan hệ và mức độ quan trọng của kết quả công việc.",
                order: 2
            },
            {
                title: "Kỹ năng hòa giải tranh chấp của bên thứ ba (HR/Manager)",
                description: "Quy trình lắng nghe trung lập và tạo cầu nối đàm phán ôn hòa.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Hòa giải viên không phán xét đúng sai ngay lập tức. Hãy lắng nghe riêng biệt từ mỗi bên trước khi tổ chức cuộc họp ba bên.",
                order: 3
            },
            {
                title: "Nghệ thuật giao tiếp phi bạo lực (Non-violent Communication)",
                description: "Công thức giao tiếp: Quan sát - Cảm xúc - Nhu cầu - Lời đề nghị.",
                duration: "45:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Tập trung miêu tả sự việc khách quan và nhu cầu bản thân thay vì sử dụng ngôn ngữ chỉ trích, quy chụp đối phương.",
                order: 4
            },
            {
                title: "Thiết lập quy chế xử lý mâu thuẫn nội bộ chính thức",
                description: "Các bước xử lý khiếu nại nhân sự minh bạch và bảo mật.",
                duration: "40:00",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Quy trình rõ ràng giúp nhân viên yên tâm chia sẻ khúc mắc mà không lo sợ bị trù dập hoặc rò rỉ thông tin cá nhân.",
                order: 5
            }
        ]
    }
];

export async function seedCourses() {
    try {
        const count = await CourseModel.countDocuments();
        if (count > 0) {
            console.log("ℹ️ Courses collection already contains data. Skipping seed.");
            return;
        }

        console.log("🌱 Seeding courses and lessons into database...");
        await CourseModel.insertMany(coursesData);
        console.log("✅ Seeded 25 courses with 125 lessons successfully!");
    } catch (error) {
        console.error("❌ Error seeding courses:", error);
    }
}
