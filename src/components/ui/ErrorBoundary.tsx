import React from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF1F3] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E7E1E3] rounded-2xl p-6 text-center space-y-4">
            <h1 className="font-display text-xl font-bold text-[#B5122A]">
              কিছু একটা ত্রুটি হয়েছে
            </h1>
            <p className="text-sm text-[#75686C]">
              দুঃখিত, এই অংশটি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পৃষ্ঠাটি রিলোড করুন।
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#B5122A] rounded-lg hover:bg-[#D61F3C] cursor-pointer"
            >
              পুনরায় লোড করুন
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
