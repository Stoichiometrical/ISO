import create from 'zustand';

const usePromotionStore = create((set) => ({
    promotion: {},
    isPromotion: false,
    setPromotion: (promotionData) => set({ promotion: promotionData }),
    setIsPromotion: (value) => set({ isPromotion: value }),
}));

export default usePromotionStore;
