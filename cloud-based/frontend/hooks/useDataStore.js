import create from 'zustand';

// Define your store
const useDataStore = create((set) => ({
    data: [], // Initialize data as an empty array
    setData: (newData) => set({ data: newData }), // Method to set data
    bundles :[],
    setBundles: (newBundles) =>set({ bundles: newBundles }), // Method to set bundles
    api_name: '', // Initialize api_name as an empty string
    setApiName: (newApiName) => set({ api_name: newApiName }),
}));

export default useDataStore;
