/** Chi phí credit theo hành động */
export const CREDIT_COSTS = {
    CV_ANALYZE: 500,
    INTERVIEW_SESSION: 1500,
    JOB_APPLY: 0,
};

export const DEFAULT_CREDITS = 6500;

export async function deductCredits(userId, amount, UserModel) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');
    const balance = user.credits ?? DEFAULT_CREDITS;
    if (balance < amount) {
        const err = new Error(`Không đủ credit. Cần ${amount}, còn ${balance}.`);
        err.status = 402;
        throw err;
    }
    user.credits = balance - amount;
    await user.save();
    return user.credits;
}

export async function addCredits(userId, amount, UserModel) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');
    user.credits = (user.credits ?? DEFAULT_CREDITS) + amount;
    await user.save();
    return user.credits;
}
