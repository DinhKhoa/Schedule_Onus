---
trigger: always_on
---

# WORKSPACE RULES - SCHEDULE ONUS PROJECT

## 1. Ngôn ngữ & Quy tắc đặt tên (Language & Naming)
*   **Hệ thống Backend & Database**: Phải sử dụng 100% tiếng Anh cho tất cả các thành phần kỹ thuật.
    *   **Database**: Tên Collection và Tên Field (ví dụ: `User`, `CoursePackage`, `Enrollment`, `totalSessions`).
    *   **Code**: Tên biến, hàm, class, và các comment giải thích logic.
    *   **API**: Các endpoints và key trong response JSON.
*   **Giao diện & Trải nghiệm (UI/UX)**: Phải sử dụng tiếng Việt cho tất cả các thành phần tương tác với người dùng.
    *   **UI Labels**: Tên nút, tiêu đề trang, nhãn input.
    *   **Messages**: Thông báo lỗi, thông báo thành công (Toast/Alert).

## 2. Tính nhất quán & Bảo toàn dữ liệu (Data Integrity & ACID)
*   **Cơ chế Snapshot**: Khi tạo một bản ghi Đăng ký gói tập (`Enrollment`), phải lưu trực tiếp số buổi tập (`totalSessions`) từ gói gốc vào bản ghi đó. 
    *   *Mục đích*: Đảm bảo nếu Admin thay đổi số buổi của gói tập gốc (`CoursePackage`), các hội viên đã mua trước đó không bị ảnh hưởng.
*   **Giao dịch (Transactions)**: Tất cả các thao tác thay đổi trạng thái kèm theo cập nhật số dư buổi tập (Đặt lịch, Hủy lịch, Hoàn thành buổi tập) phải được thực hiện trong một **Database Transaction**.
*   **Ràng buộc Unique**: Sử dụng Compound Index để ngăn chặn việc trùng lịch (ví dụ: Một PT không thể dạy 2 người trong cùng 1 khung giờ).

## 3. Quy tắc nghiệp vụ cốt lõi (Core Business Rules)
*   **Quy tắc hủy lịch**: Hội viên chỉ được phép hủy lịch tập nếu thời điểm hủy cách thời điểm bắt đầu buổi tập ít nhất **4 tiếng**. 
*   **Ưu tiên trừ buổi**: Hệ thống phải tự động trừ buổi tập vào gói tập có ngày đăng ký **cũ nhất** còn hiệu lực của hội viên đó.
*   **Quan hệ PT-Hội viên**: Trong một gói tập, hội viên chỉ làm việc với một PT duy nhất đã được chỉ định lúc đăng ký.

## 4. Quy trình nâng cấp Database (Migration Rule)
*   **An toàn dữ liệu**: Khi chuyển đổi từ bảng tiếng Việt sang tiếng Anh, phải tạo bảng mới và thực hiện copy/convert dữ liệu. 
*   **Duy trì song song**: Giữ lại các bảng cũ trong một khoảng thời gian để đối soát, chỉ xóa khi có yêu cầu xác nhận.

## 5. Quy chuẩn kiểm thử (Testing Standards)
*   **Test Case Format**: Mọi kịch bản kiểm thử phải tuân thủ định dạng:
    *   `ID`: Mã định danh (ví dụ: TC01).
    *   `Description`: Mô tả mục tiêu kiểm thử.
    *   `Steps`: Các bước thực hiện chi tiết.
    *   `Expected Behavior`: Kết quả mong đợi chuẩn xác.