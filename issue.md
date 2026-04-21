# 📅 Hệ thống Đặt Lịch Tập Online - ONUS

Dưới đây là mô tả chi tiết về logic nghiệp vụ và các chức năng chính của dự án dành cho ba đối tượng người dùng: **Admin**, **Khách hàng** và **PT**.

---

## 👥 Phân quyền & Chức năng

### 1. 🛠️ Quản trị viên (Admin)

Sau khi đăng nhập, Admin truy cập vào mục **Quản lý lịch**. Hệ thống sẽ mặc định hiển thị lịch các ngày hiện tại và tuần tới.

* **Dữ liệu hiển thị:** Các khung giờ được lấy từ bảng `GioTap` (chỉ lấy các bản ghi có trạng thái `Active`).
* **Các hành động có thể thực hiện:**
  * [X] **Quản lý Ngày tập:** Chỉnh sửa trạng thái (Active/Inactive). Nếu đặt là `Inactive`, tất cả khung giờ trong ngày đó sẽ không khả dụng.
  * [X] **Quản lý Giờ tập:** Thêm mới, chỉnh sửa trạng thái hoặc xóa các khung giờ tập.

### 2. 👤 Khách hàng (Customer)

Khách hàng thực hiện đăng ký lịch tập cho **tuần kế tiếp**.

* **Logic chọn PT tự động:**
  * Hệ thống lấy `ID_KhachHang` khi đăng nhập.
  * Tự động tìm kiếm trong bảng `DangKyKhoaTap` bản ghi có ngày đăng ký **lâu nhất** (ưu tiên tiêu dùng gói cũ trước) và có `SoLuongBuoiTap > 0`.
  * Lấy `ID_PT` từ bản ghi tìm thấy để hiển thị lịch tương ứng.
* **Dữ liệu hiển thị:** Lịch các ngày trong tuần tiếp theo và các khung giờ `Active` của PT tương ứng.
* **Các hành động có thể thực hiện:**
  * [X] Chọn ngày tập.
  * [X] Chọn giờ tập.
  * [X] **Đặt lịch:** Xác nhận đăng ký buổi tập.
  * [X] **Hủy lịch:** Chỉ được phép thực hiện nếu cách giờ tập ít nhất **2 tiếng**.

### 3. 👟 Huấn luyện viên (PT)

PT đóng vai trò xác thực và quản lý buổi tập trực tiếp với khách hàng.

* **Hạn chế:** Không có quyền tự đăng ký hoặc thay đổi lịch dạy (do Admin/Hệ thống quy định).
* **Chức năng chính:**
  * [X] **Xác nhận lịch tập:** Kiểm tra và xác nhận các yêu cầu đặt lịch từ khách hàng đã đăng ký với mình.

---

## ⚙️ Quy tắc Nghiệp vụ (Business Rules)

| Quy tắc                         | Chi tiết                                                                                 |
| :------------------------------- | :---------------------------------------------------------------------------------------- |
| **Quy trình đặt lịch** | Khách hàng chỉ được đặt lịch cho tuần kế tiếp.                                |
| **Ưu tiên gói tập**    | Tự động chọn gói tập cũ nhất còn buổi để thực hiện đặt đặt lịch.       |
| **Hủy lịch**             | Thời hạn hủy tối thiểu:**2 giờ** trước khi bắt đầu.                      |
| **Trạng thái Ngày**     | Nếu ngày bị `Inactive`, toàn bộ giờ tập trong ngày đó sẽ bị vô hiệu hóa. |

---

*Ghi chú: Cần đảm bảo tính đồng bộ giữa bảng `GioTap` và trạng thái hiển thị trên giao diện người dùng.*
