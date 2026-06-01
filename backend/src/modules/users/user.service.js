import { UserModel } from "./user.model.js";
import { hashPassword, comparePassword } from "../../utils/bcrypt.util.js";

export class UserService {
    // Cập nhật thông tin profile
    static async updateProfile(userId, updateData) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        // Allowed fields to update
        const allowedFields = [
            "name", "phone", "address", "avatar", "avatarUrl",
            "resume", "skills", "experience", "education",
            "companyName", "companyDescription", "companyWebsite"
        ];

        // Mảng skills nếu có thì parse lại nếu là string, hoặc giữ nguyên nếu là array. (Có thể xử lý ở Controller)

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                user[field] = updateData[field];
            }
        });

        await user.save();

        // Trả về user details (ẩn password, otp)
        const updatedUser = await UserModel.findById(userId).select("-password -otp -otpExpires");
        return updatedUser;
    }

    // Đổi mật khẩu
    static async changePassword(userId, oldPassword, newPassword) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) throw new Error("Mật khẩu cũ không chính xác");

        user.password = newPassword; // Sẽ được hash ở pre-save hook
        await user.save();

        return { message: "Đổi mật khẩu thành công" };
    }
}
