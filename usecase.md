# USE CASE DOCUMENTATION - PRIVATE FITNESS BOOKING SYSTEM

## 1. Đăng nhập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-1 |
| **Use case name** | Đăng nhập |
| **Description** | Là user, tôi muốn đăng nhập vào hệ thống. |
| **Actors** | Hội viên, PT, Quản trị viên |
| **Priority** | High |
| **Triggers** | Người dùng chọn đăng nhập. |
| **Pre-conditions** | - Tài khoản người dùng đã được tạo sẵn. - Thiết bị của người dùng đã kết nối Internet khi đăng nhập. |
| **Post-conditions** | Người dùng được xác thực và truy cập vào hệ thống. |
| **Main flow** | 1. Hệ thống hiển thị màn hình đăng nhập gồm các ô nhập Số điện thoại và Mật khẩu. 2. Người dùng nhập thông tin đăng nhập. 3. Người dùng nhấn nút “Đăng nhập”. 4. Hệ thống chuyển đến giao diện chính. |
| **Alternative flows** | N/A |
| **Exception flows** | 4a. Nếu số điện thoại hoặc mật khẩu không khớp, hệ thống hiển thị thông báo “Đăng nhập không thành công.” và yêu cầu nhập lại. 4b. Nếu tài khoản nhập sai quá số lần quy định, hệ thống hiển thị thông báo: “Tài khoản của bạn đã bị khóa. Vui lòng thử lại sau.” |

---

## 2. Đăng xuất

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-2 |
| **Use case name** | Đăng xuất |
| **Description** | Cho phép người dùng kết thúc phiên làm việc hiện tại và thoát khỏi hệ thống nhằm đảm bảo an toàn thông tin tài khoản. |
| **Actors** | Hội viên, PT, Quản trị viên |
| **Priority** | High |
| **Triggers** | Người dùng nhấn vào biểu tượng đăng xuất bên cạnh biểu tượng người dùng. |
| **Pre-conditions** | Người dùng đã đăng nhập hệ thống. |
| **Post-conditions** | - Phiên đăng nhập của người dùng được kết thúc. - Người dùng được chuyển về màn hình đăng nhập. |
| **Main flow** | 1. Hệ thống yêu cầu xác nhận đăng xuất. 2. Người dùng xác nhận đăng xuất. 3. Hệ thống kết thúc phiên đăng nhập hiện tại. 4. Hệ thống chuyển người dùng về màn hình Đăng nhập. |
| **Alternative flows** | 2a. Người dùng chọn “Hủy” thì hệ thống không kết thúc phiên đăng nhập và người dùng tiếp tục sử dụng hệ thống. |
| **Business rules** | - Sau khi đăng xuất, người dùng phải đăng nhập lại để tiếp tục sử dụng hệ thống. - Hệ thống phải xóa hoặc vô hiệu hóa token/phiên đăng nhập sau khi đăng xuất. - Tự động đăng xuất sau 15 phút không có thao tác. |
| **Non-functional** | - Thời gian xử lý đăng xuất không vượt quá 2 giây. - Đảm bảo không truy cập lại được các chức năng yêu cầu đăng nhập sau khi đăng xuất. |

---

## 3. Đổi mật khẩu

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-3 |
| **Use case name** | Đổi mật khẩu |
| **Description** | Cho phép người dùng thay đổi mật khẩu tài khoản hiện tại nhằm tăng cường bảo mật và đảm bảo an toàn thông tin khi sử dụng hệ thống. |
| **Actors** | Hội viên, PT, Quản trị viên |
| **Priority** | High |
| **Triggers** | Người dùng nhấn vào nút Hồ sơ và chọn Đổi mật khẩu. |
| **Pre-conditions** | Người dùng đã đăng nhập hệ thống. |
| **Post-conditions** | Mật khẩu mới được cập nhật thành công. |
| **Main flow** | 1. Hệ thống hiển thị form đổi mật khẩu gồm: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới. 2. Người dùng nhập đầy đủ thông tin và xác nhận. 3. Hệ thống kiểm tra tính hợp lệ của mật khẩu hiện tại. 4. Hệ thống kiểm tra mật khẩu mới theo quy tắc bảo mật. 5. Hệ thống kiểm tra xác nhận mật khẩu. 6. Hệ thống cập nhật mật khẩu mới. 7. Hệ thống thông báo đổi mật khẩu thành công. |
| **Exception flows** | 3a. Nếu mật khẩu hiện tại không chính xác thì hệ thống hiển thị thông báo lỗi. 4a. Nếu mật khẩu mới không thỏa mãn quy tắc bảo mật thì hệ thống hiển thị thông báo và yêu cầu nhập lại. 5a. Nếu mật khẩu mới và xác nhận mật khẩu không trùng nhau thì hệ thống hiển thị thông báo lỗi và yêu cầu người dùng nhập lại. |
| **Business rules** | - Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt. - Mật khẩu mới không được trùng với mật khẩu cũ. |

---

## 4. Quản lý thông tin cá nhân

### 4.1. Xem thông tin cá nhân

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-4.1 |
| **Use case name** | Xem thông tin cá nhân |
| **Description** | Hội viên/PT muốn xem thông tin cá nhân của mình. |
| **Actors** | Hội viên, PT |
| **Priority** | High |
| **Triggers** | Hội viên/PT chọn chức năng “Hồ sơ cá nhân”. |
| **Main flow** | 1. Hội viên/PT chọn “Hồ sơ cá nhân”. 2. Hệ thống sẽ truy xuất dữ liệu cá nhân. 3. Thông tin sẽ được hiển thị gồm: Họ và tên, số điện thoại, ngày sinh, giới tính. |
| **Exception flows** | 2a. Nếu hệ thống không truy xuất được dữ liệu, hiển thị thông báo lỗi và yêu cầu thử lại. |

### 4.2. Cập nhật thông tin cá nhân

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-4.2 |
| **Use case name** | Cập nhật thông tin cá nhân |
| **Description** | Hội viên/PT muốn cập nhật thông tin cá nhân của mình. |
| **Actors** | Hội viên, PT |
| **Priority** | High |
| **Main flow** | 1. Hội viên/PT chọn “Cập nhật thông tin”. 2. Hệ thống sẽ hiển thị form chỉnh sửa thông tin cá nhân. 3. Hội viên/PT thay đổi thông tin cần sửa. 4. Hội viên/PT chọn “Lưu thay đổi”. 5. Hệ thống kiểm tra dữ liệu và cập nhật vào hệ thống. 6. Hiển thị thông báo “Cập nhật thành công”. |
| **Exception flows** | 5a. Nếu Hội viên/PT bỏ trống hoặc nhập sai kiểu thông tin, hệ thống thông báo lỗi “Giá trị nhập vào không đúng định dạng, vui lòng thử lại.” |
| **Business rules** | Số điện thoại phải đúng định dạng và là duy nhất. Mã Hội viên/PT không được thay đổi. |

---

## 5. Quản lý lịch tập cá nhân

### 5.1. Xem lịch tập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-5.1 |
| **Use case name** | Xem lịch tập |
| **Description** | Là hội viên, tôi muốn xem toàn bộ lịch tập của cá nhân bao gồm các lịch sắp diễn ra và các lịch đã diễn ra trong quá khứ. |
| **Actors** | Hội viên |
| **Main flow** | 1. Hội viên chọn chức năng xem lịch tập. 2. Hệ thống hiển thị danh sách lịch tập sắp xếp theo thời gian giảm dần (mới nhất đến cũ nhất). - Lịch sắp diễn ra hiển thị phía trên. - Lịch đã diễn ra hiển thị phía dưới. - Thông tin hiển thị: Ngày tập, Khung giờ, Trạng thái, Tên gói, HLV, Địa điểm. |
| **Alternative flows** | 2a. Nếu hội viên chưa có lịch tập nào, hệ thống hiển thị thông báo: “Bạn chưa có lịch tập nào.” và kết thúc. |
| **Business rules** | Trạng thái lịch tập phân biệt bằng màu: "Đang chờ" (vàng), "Hoàn thành" (xanh). |

### 5.2. Đăng ký lịch tập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-5.2 |
| **Use case name** | Đăng ký lịch tập |
| **Description** | Là hội viên, tôi muốn đăng ký lịch tập để đặt trước phòng tập theo ngày và khung giờ mong muốn. |
| **Actors** | Hội viên |
| **Pre-conditions** | Hội viên còn số buổi tập hợp lệ. Khung giờ được chọn đang còn trống. |
| **Main flow** | 1. Hệ thống hiển thị danh sách ngày và khung giờ. 2. Hội viên chọn ngày tập và khung giờ trống. 3. Hệ thống hiển thị yêu cầu xác nhận. 4. Hội viên chọn xác nhận đăng ký lịch tập. 5. Hệ thống kiểm tra số buổi tập còn lại, lưu thông tin lịch, cập nhật trạng thái khung giờ sang “Đã đặt”. 6. Hệ thống hiển thị thông báo “Đăng ký lịch tập thành công”. |
| **Exception flows** | 5a. Nếu số buổi tập = 0, Hệ thống hiển thị thông báo: “Bạn đã sử dụng hết số buổi tập” và kết thúc. |
| **Business rules** | - Mỗi ngày – khung giờ chỉ được phép 1 hội viên đăng ký với 1 PT. - Khung giờ có trạng thái “Đã đặt” thì không cho phép chọn. - Không cho phép đăng ký lịch trong quá khứ. |

### 5.3. Hủy lịch tập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-5.3 |
| **Use case name** | Hủy lịch tập |
| **Description** | Là hội viên, tôi muốn hủy lịch tập. |
| **Actors** | Hội viên |
| **Main flow** | 1. Hội viên chọn chức năng xem lịch tập. 2. Hệ thống hiển thị danh sách lịch tập cá nhân. 3. Hội viên chọn nút hủy lịch tập. 4. Hệ thống hiển thị thông báo xác nhận hủy. 5. Hội viên xác nhận đồng ý hủy. 6. Hệ thống cập nhật trạng thái lịch tập thành “Đã hủy”, cập nhật trạng thái khung giờ thành “Trống”. 7. Hệ thống hiển thị thông báo “Hủy lịch tập thành công”. |
| **Business rules** | Hội viên chỉ được hủy lịch tập trước giờ tập 4 tiếng. |

---

## 6. Quản lý lịch dạy cá nhân

### 6.1. Xem lịch dạy cá nhân

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-6.1 |
| **Use case name** | Xem lịch dạy cá nhân |
| **Description** | Cho phép PT xem lịch dạy tuần hiện tại và các tuần trước đó, bao gồm thông tin chi tiết và trạng thái buổi dạy. |
| **Actors** | PT |
| **Main flow** | 1. Sau khi đăng nhập, hệ thống điều hướng đến màn hình Lịch dạy cá nhân. 2. Hệ thống truy xuất và hiển thị danh sách các buổi dạy (Ngày, Khung giờ, Tên hội viên, Trạng thái). |
| **Alternative flows** | 3a. Nếu không có lịch dạy, hiển thị “Bạn hiện chưa có lịch dạy nào trong tuần này.”. 3b. Cuộn trang về trước để xem lịch cũ. 3c. Cuộn trang về sau để xem lịch tuần sau. |

### 6.2. Cập nhật trạng thái lịch

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-6.2 |
| **Use case name** | Cập nhật trạng thái lịch |
| **Description** | Cho phép PT cập nhật trạng thái (hoàn thành/đã hủy) cho buổi dạy. |
| **Actors** | PT |
| **Main flow** | 1. Hệ thống hiển thị chi tiết buổi tập. 2. PT chọn “Hoàn thành”. 3. Hệ thống yêu cầu xác nhận. 4. PT xác nhận. 5. Hệ thống cập nhật trạng thái thành “Hoàn thành” và thông báo thành công. |
| **Exception flows** | 2b. Nếu cố đánh dấu hoàn thành cho buổi chưa diễn ra, hệ thống báo lỗi. |
| **Business rules** | Sau khi đã cập nhật trạng thái, không cho phép thay đổi lại. |

---

## 7. Quản lý khóa tập

### 7.1. Xem danh sách khóa tập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-7.1 |
| **Use case name** | Xem danh sách khoá tập |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Chọn chức năng xem “Danh sách khoá học”. 2. Hiển thị màn hình danh sách khoá tập (tên, số buổi, nút sửa/xóa). |
| **Alternative flows** | 2a. Nhập tên khoá tập để tìm kiếm. |

### 7.2. Thêm khóa tập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-7.2 |
| **Use case name** | Thêm khóa tập |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Chọn nút thêm khóa tập mới. 2. Hiển thị form (tên, số buổi tập). 3. Nhập thông tin. 4. Kiểm tra thông tin. 5. Xác nhận tạo và hiển thị thông báo “Thành công”. |
| **Exception flows** | 4a. Nếu số buổi tập không phải số, < 0 hoặc tên bỏ trống, hiện thông báo “Dữ liệu không hợp lệ”. |

### 7.3. Cập nhật khóa tập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-7.3 |
| **Use case name** | Cập nhật khóa tập |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Chọn biểu tượng chi tiết khoá tập. 2. Hiển thị form thông tin. 3. Nhập thông tin muốn thay đổi. 4. Kiểm tra và cập nhật. 5. Hiển thị thông báo “Thành công”. |
| **Alternative flows** | 3a. Chọn xoá khoá tập -> Xác nhận xoá. |

---

## 8. Quản lý tài khoản

### 8.1. Xem danh sách tài khoản

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-8.1 |
| **Use case name** | Xem danh sách tài khoản |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Chọn mục "Quản lý tài khoản". 2. Hệ thống truy vấn và hiển thị danh sách (ID, Tên, SĐT, Vai trò, Trạng thái). |
| **Alternative flows** | 1a. Tìm kiếm theo tên/SĐT. 1b. Lọc theo vai trò (PT/Hội viên). |

### 8.2. Thêm tài khoản

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-8.2 |
| **Use case name** | Thêm tài khoản |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Nhấn nút "Thêm mới". 2. Hiển thị form nhập liệu. 3. Nhập: Họ tên, SĐT, Vai trò. 4. Hệ thống kiểm tra SĐT duy nhất. 5. Lưu tài khoản và thông báo thành công. |
| **Exception flows** | 4a. SĐT đã tồn tại: Hệ thống báo lỗi. |

### 8.3. Cập nhật trạng thái tài khoản

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-8.3 |
| **Use case name** | Cập nhật trạng thái tài khoản |
| **Description** | Thay đổi trạng thái giữa "Active" và "Inactive". |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Xác định tài khoản cần đổi. 2. Chọn chuyển trạng thái. 3. Hệ thống hiển thị xác nhận. 4. Nhấn "Xác nhận". 5. Hệ thống cập nhật Database. |
| **Business rules** | Nếu trạng thái là Inactive, người dùng không thể đăng nhập. |

### 8.4. Phân quyền tài khoản

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-8.4 |
| **Use case name** | Phân quyền tài khoản |
| **Description** | Thay đổi vai trò tài khoản (PT/Hội viên). |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Chọn tài khoản cần phân quyền. 2. Chọn vai trò mới từ dropdown. 3. Nhấn "Lưu thay đổi". |

### 8.5. Xóa tài khoản

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-8.5 |
| **Use case name** | Xóa tài khoản |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Chọn tài khoản muốn xóa. 2. Hệ thống cảnh báo "Xác nhận xóa?". 3. Nhấn "Xác nhận". 4. Thực hiện xóa. |
| **Exception flows** | 2a. Nếu là PT đang có lịch dạy: Báo lỗi "Không thể xóa PT đang có lịch tập đang chờ". |

---

## 9. Quản lý lịch (Admin)

### 9.1. Xem danh sách lịch

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-9.1 |
| **Use case name** | Xem danh sách lịch |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Truy cập tính năng Quản lý lịch. 2. Hệ thống hiển thị giao diện. 3. Chọn một ngày cụ thể. 4. Hiển thị danh sách tất cả các slot giờ tập của ngày đó. |

### 9.2. Thêm lịch

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-9.2 |
| **Use case name** | Thêm lịch |
| **Description** | Tạo khung giờ tập (slot) cho Hội viên đặt chỗ. |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Chọn ngày cần thêm lịch. 2. Nhập thông tin khung giờ (Bắt đầu - Kết thúc). 3. Chọn “Chỉ áp dụng hôm nay” hoặc "Tất cả các ngày". 4. Xác nhận lưu. 5. Hệ thống kiểm tra trùng lặp và lưu. |
| **Exception flows** | 4a. Khung giờ mới bị trùng/chồng lấn: Báo lỗi. |

### 9.3. Cập nhật trạng thái lịch

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-9.3 |
| **Use case name** | Cập nhật trạng thái lịch |
| **Description** | Bật/Tắt (Active/Inactive) ngày tập hoặc slot tập. |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Chọn đối tượng (Ngày hoặc Slot). 2. Thay đổi trạng thái tại nút gạt (toggle). 3. Hệ thống xác nhận và cập nhật. |
| **Alternative flows** | 2a. Nếu tắt trạng thái Ngày -> Tất cả slot trong ngày chuyển sang Inactive. |

### 9.4. Xóa lịch

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-9.4 |
| **Use case name** | Xóa lịch |
| **Actors** | Quản trị viên |
| **Pre-conditions** | Slot hoặc ngày tập chưa có Hội viên nào đặt chỗ. |
| **Main flow** | 1. Chọn lịch (ngày/slot) muốn xóa. 2. Hệ thống kiểm tra điều kiện. 3. Hiển thị hộp thoại chọn: "Sự kiện này" hoặc "Tất cả sự kiện". 4. Thực hiện xóa. |
| **Exception flows** | 2a. Slot đã có người đặt: Thông báo không thể xóa. |

---

## 10. Quản lý đăng ký khóa

### 10.1. Thêm mới đăng ký khóa tập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-10.1 |
| **Use case name** | Thêm mới đăng ký khóa tập |
| **Description** | Khởi tạo đơn đăng ký khóa tập mới cho Hội viên, chỉ định PT phụ trách. |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Mở popup "Thêm đăng ký mới". 2. Chọn tên Hội viên, Khóa tập, Ngày đăng ký, PT phụ trách. 3. Nhấn "Xác nhận". 4. Hệ thống kiểm tra và lưu. |
| **Exception flows** | 7b. Hội viên đã đăng ký khóa này và vẫn còn hiệu lực: Báo lỗi trùng lặp. |

### 10.2. Xem lịch sử đăng ký khóa tập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-10.2 |
| **Use case name** | Xem lịch sử đăng ký khóa tập |
| **Actors** | Quản trị viên |
| **Main flow** | 1. Hệ thống hiển thị danh sách các bản ghi đăng ký. 2. Các cột: Tên Hội viên, Tên khóa, Ngày đăng ký, PT phụ trách. |

### 10.3. Xóa đăng ký khóa tập

| Mục | Nội dung chi tiết |
| :--- | :--- |
| **Use case ID** | UC-10.3 |
| **Use case name** | Xóa đăng ký khóa tập |
| **Actors** | Quản trị viên |
| **Pre-conditions** | Khóa tập này chưa được Hội viên bắt đầu sử dụng (chưa có lịch tập thực tế). |
| **Main flow** | 1. Xác định đăng ký cần xóa. 2. Hệ thống hiển thị popup xác nhận. 3. Nhấn "Xác nhận". 4. Hệ thống xóa bản ghi. |
| **Exception flows** | 4a. Khóa tập đã phát sinh lịch tập: Báo lỗi "Không thể xóa đăng ký đã phát sinh lịch sử tập luyện". |