import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

const DashboardPage = () => {
    return (
        <MainLayout>
            <div className='flex flex-col gap-10 px-6 pb-20 w-full h-full'>
                <h2 className='text-2xl leading-9 text-white font-noto'>Hello John</h2>
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.22504611858!2d103.84425004999999!3d1.31400005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da11238a8b9375%3A0x887869cf52abf5c4!2sSingapore!5e0!3m2!1sen!2sid!4v1749491915888!5m2!1sen!2sid" width="600" height="450" loading="lazy" className="w-full h-full rounded-2xl"></iframe>
            </div>
        </MainLayout>
    )
}

export default DashboardPage