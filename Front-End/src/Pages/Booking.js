import React, { useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../Styles/Booking.css';

const Booking = () => {
    const formRef = useRef(null);

    const scrollToForm = () => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleSubmit = async (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);
            const bookingData = {};
            formData.forEach((value, key) => {
                bookingData[key] = value;
            });

            try {
                const response = await fetch('https://find-item.vercel.app/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData),
                });

                if (response.ok) {
                    await response.json();
                    Swal.fire({
                        icon: 'success',
                        title: 'Submission Successful!',
                        text: 'Your lost item report has been submitted successfully.',
                    });
                    event.target.reset();
                } else {
                    const errorData = await response.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Submission Failed',
                        text: `Submission failed: ${errorData.message}`,
                    });
                }
            } catch (error) {
                console.error('Error submitting report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: 'There was an issue submitting your report. Please try again.',
                });
            }
        };

        const form = document.getElementById('bookingForm');
        form.addEventListener('submit', handleSubmit);

        return () => {
            form.removeEventListener('submit', handleSubmit);
        };
    }, []);

    return (
        <div className="main-book">
            <div className="homepage1" id="book">
                <div className="header-content">
                    <h1 className="title-header">Lost Something? <br />Report It Here.</h1>
                    <p className="subtext">
                        Provide details about your lost item, and our team will help you reconnect<br />
                        with your belongings. Submit your report and we'll get back to you.
                    </p>
                    <button className="cta-button" onClick={scrollToForm}>Report Now</button>
                </div>
            </div>

            <div className="booking-container" ref={formRef}>
                <form className="booking-form" id="bookingForm">
                    <div>
                        <label>Your Name</label>
                        <input type="text" id="customerName" name="customerName" placeholder="Enter full name" required />
                    </div>
                    <div>
                        <label>Phone Number</label>
                        <input type="text" id="contact1" name="contact1" placeholder="Input phone number" required />
                    </div>
                    <div>
                        <label>Email Address (Optional)</label>
                        <input type="email" id="email" name="email" placeholder="Enter Email" />
                    </div>
                    <div>
                        <label>Last Seen Location</label>
                        <input type="text" id="eventLocation" name="eventLocation" placeholder="Enter specific location" required />
                    </div>
                    <div>
                        <label>Date of Loss</label>
                        <input type="date" id="eventDate" name="eventDate" required />
                    </div>
                    <div>
                        <label>Approximate Time</label>
                        <input type="time" id="eventTime" name="eventTime" required />
                    </div>
                    <div>
                        <label>Item Description</label>
                        <textarea rows="4" id="eventDetails" name="eventDetails" placeholder="Add more details about the item (color, size, unique identifiers, etc.)"></textarea>
                    </div>
                    <button type="submit">Submit Report</button>
                </form>
            </div>
        </div>
    );
};

export default Booking;
