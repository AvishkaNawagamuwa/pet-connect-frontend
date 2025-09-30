import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    // Try to fetch from API
                    const result = await authService.getProfile();
                    if (result.success) {
                        setUser(result.data);
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#d5a67e]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d2e1d] mx-auto mb-4"></div>
                    <p className="text-[#4d2e1d] font-semibold">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#d5a67e]">
            {/* Header */}
            <div className="bg-[#4d2e1d] text-white p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">🐾 PetConnect Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm">Welcome, {user?.name || 'User'}!</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* User Info Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-[#4d2e1d] mb-4">Profile Info</h2>
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
                            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                            <p><strong>Role:</strong> {user?.role || 'Owner'}</p>
                            <p><strong>Member since:</strong> {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Recently'}</p>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-[#4d2e1d] mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full bg-[#8c6239] hover:bg-[#6d4a2b] text-white py-2 px-4 rounded-lg transition-all">
                                Add New Pet
                            </button>
                            <button className="w-full bg-[#8c6239] hover:bg-[#6d4a2b] text-white py-2 px-4 rounded-lg transition-all">
                                Find Pet Friends
                            </button>
                            <button className="w-full bg-[#8c6239] hover:bg-[#6d4a2b] text-white py-2 px-4 rounded-lg transition-all">
                                Ask Pet Expert
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-[#4d2e1d] mb-4">Your Stats</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Posts:</span>
                                <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pet Friends:</span>
                                <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Messages:</span>
                                <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Adoptions:</span>
                                <span className="font-semibold">0</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Navigation Links */}
                <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-[#4d2e1d] mb-4">Explore PetConnect</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a href="/home" className="text-center p-4 bg-[#d5a67e] rounded-lg hover:bg-[#c9986f] transition-all">
                            <div className="text-2xl mb-2">🏠</div>
                            <span className="font-semibold">Home</span>
                        </a>
                        <a href="/adoption" className="text-center p-4 bg-[#d5a67e] rounded-lg hover:bg-[#c9986f] transition-all">
                            <div className="text-2xl mb-2">🐕</div>
                            <span className="font-semibold">Adoption</span>
                        </a>
                        <a href="/chat" className="text-center p-4 bg-[#d5a67e] rounded-lg hover:bg-[#c9986f] transition-all">
                            <div className="text-2xl mb-2">💬</div>
                            <span className="font-semibold">AI Chat</span>
                        </a>
                        <a href="/news" className="text-center p-4 bg-[#d5a67e] rounded-lg hover:bg-[#c9986f] transition-all">
                            <div className="text-2xl mb-2">📰</div>
                            <span className="font-semibold">News</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
