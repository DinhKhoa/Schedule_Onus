# HỆ THỐNG KIỂM THỬ - PROJECT SCHEDULE ONUS

Mọi kịch bản kiểm thử tuân thủ định dạng yêu cầu trong WORKSPACE_RULES.md.

## 1. Kiểm thử Tính nhất quán dữ liệu (Snapshot)

| ID | Description | Steps | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **TC01** | Kiểm tra Snapshot số buổi tập khi Admin thay đổi gói tập gốc | 1. Admin tạo gói tập "Yoga 10" với 10 buổi.<br>2. Hội viên A đăng ký gói "Yoga 10".<br>3. Admin vào phần quản lý gói tập, sửa "Yoga 10" thành 15 buổi. | Trong danh sách đăng ký của Hội viên A, hệ thống vẫn phải hiển thị "Tổng số buổi: 10". Không được tự động nhảy lên 15. |

## 2. Kiểm thử Quy tắc Nghiệp vụ (Cancellation)

| ID | Description | Steps | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **TC02** | Kiểm tra hủy lịch tập hợp lệ (> 4 tiếng) | 1. Hội viên đặt lịch tập vào lúc 18:00 hôm nay.<br>2. Vào lúc 10:00 sáng (cách 8 tiếng), Hội viên nhấn nút "Hủy lịch". | Hệ thống thông báo "Hủy lịch thành công". Số buổi còn lại của Hội viên được cộng lại 1 buổi. |
| **TC03** | Kiểm tra chặn hủy lịch sát giờ (< 4 tiếng) | 1. Hội viên đặt lịch tập vào lúc 18:00 hôm nay.<br>2. Vào lúc 15:30 chiều (cách 2.5 tiếng), Hội viên nhấn nút "Hủy lịch". | Hệ thống báo lỗi: "Không thể hủy lịch trong vòng 4 tiếng trước buổi tập". Trạng thái lịch vẫn là "Đã đặt". |

## 3. Kiểm thử Ràng buộc ACID (Concurrency)

| ID | Description | Steps | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **TC04** | Kiểm tra chặn trùng lịch PT (1 PT không dạy 2 người cùng lúc) | 1. Hội viên A đặt lịch với PT Sơn vào lúc 08:00 sáng Thứ 2.<br>2. Hội viên B cũng chọn PT Sơn và cố gắng đặt lịch vào đúng 08:00 sáng Thứ 2 đó. | Hội viên B nhận thông báo: "PT của bạn đã có lịch dạy vào khung giờ này". Database không được phép tạo thêm bản ghi trùng. |
| **TC05** | Kiểm tra tự động trừ buổi tập vào gói cũ nhất | 1. Hội viên có Gói 1 (mua ngày 01/01, còn 2 buổi) và Gói 2 (mua ngày 10/01, còn 10 buổi).<br>2. Hội viên đặt và hoàn thành 1 buổi tập. | Hệ thống phải trừ 1 buổi vào Gói 1 (còn lại 1 buổi). Gói 2 vẫn giữ nguyên 10 buổi. |
