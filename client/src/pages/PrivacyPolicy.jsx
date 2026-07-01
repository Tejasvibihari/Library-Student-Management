import React from 'react'

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-lg">
                <h1 className="text-3xl font-semibold text-slate-900">Privacy Policy</h1>
                <p className="mt-2 text-sm text-slate-400">Last updated: July 1, 2026</p>
                <p className="mt-4 text-slate-600 leading-7">
                    Bihari Library ("we," "our," or "the app") is a personalized library management application built to help
                    library administrators manage student admissions, seat allotments, seat payments, and shift scheduling for
                    the Bihari Library community. This Privacy Policy explains what information we collect, how we use it,
                    and how we protect it when you use our app or services.
                </p>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">Information We Collect</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        To operate the app and support day-to-day library administration, we collect the following categories of information:
                    </p>
                    <ul className="mt-3 list-disc pl-6 text-slate-600 leading-7 space-y-1">
                        <li><span className="font-medium text-slate-800">Student admission details</span> — such as name, contact information, and enrollment information provided at the time of admission.</li>
                        <li><span className="font-medium text-slate-800">Seat and shift information</span> — including seat assignments, seat availability, and shift timings selected by the student.</li>
                        <li><span className="font-medium text-slate-800">Payment records</span> — including seat payment amounts, payment status, and payment history, used to track dues and confirm seat bookings.</li>
                        <li><span className="font-medium text-slate-800">Account credentials</span> — such as login usernames and passwords, which are stored only in encrypted form.</li>
                    </ul>
                    <p className="mt-3 text-slate-600 leading-7">
                        We only collect information that is directly necessary to manage admissions, seat payments, and shift
                        scheduling within the library. We do not request or collect data unrelated to these core functions.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">How We Use Your Information</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        The information we collect is used solely to operate and improve the Bihari Library management system, including to:
                    </p>
                    <ul className="mt-3 list-disc pl-6 text-slate-600 leading-7 space-y-1">
                        <li>Process and manage student admissions.</li>
                        <li>Allot library seats and manage seat availability.</li>
                        <li>Record and track seat payments and dues.</li>
                        <li>Organize and manage student shift schedules.</li>
                        <li>Allow authorized administrators to communicate with students regarding their admission, seat, or payment status.</li>
                    </ul>
                    <p className="mt-3 text-slate-600 leading-7">
                        We do not use your data for advertising, profiling, or any purpose outside of library administration.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">Where Your Data Is Stored</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        All application data, including student records, seat and shift details, and payment information, is stored
                        securely on our own Virtual Private Server (VPS) hosted with Hostinger. We do not use third-party cloud
                        storage providers beyond our Hostinger VPS infrastructure to store your personal data.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">How We Protect Your Data</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        We take the security of your data seriously and apply the following safeguards:
                    </p>
                    <ul className="mt-3 list-disc pl-6 text-slate-600 leading-7 space-y-1">
                        <li>All account passwords are stored in encrypted form and are never stored or transmitted as plain text.</li>
                        <li>Access to student, seat, and payment data on our VPS is restricted to authorized library administrators only.</li>
                        <li>We follow industry-standard practices to protect data against unauthorized access, alteration, or disclosure.</li>
                    </ul>
                    <p className="mt-3 text-slate-600 leading-7">
                        While we take reasonable steps to protect your information, no method of electronic storage or transmission
                        is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">Third-Party Sharing</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        We do not sell, rent, or share personal or student data with any third-party applications, advertisers,
                        or external organizations. Your data is used exclusively for the operation and management of the Bihari
                        Library system, by authorized Bihari Library personnel.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">Data Retention</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        We retain student admission, seat, and payment records for as long as necessary to support ongoing
                        library administration and record-keeping. If you would like your data reviewed, updated, or removed,
                        you may contact us using the details below.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">Your Choices and Rights</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        You may contact us at any time to request access to, correction of, or deletion of your personal
                        information held within the app, subject to any records we are required to keep for administrative
                        or record-keeping purposes.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">Children's Privacy</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        The app may be used by library administrators to manage records of students who are minors, as part of
                        the admission process for the library. Such information is provided and managed by library administrators
                        or guardians, and is used strictly for library administration purposes as described in this policy.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">App Store &amp; Play Store Compliance</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        This application is intended for use by library administrators and students to manage admissions, seat
                        payments, and shift schedules. In line with Play Store and App Store requirements, we confirm that:
                    </p>
                    <ul className="mt-3 list-disc pl-6 text-slate-600 leading-7 space-y-1">
                        <li>We do not collect any data beyond what is necessary for library administration.</li>
                        <li>We do not perform unauthorized tracking, profiling, or advertising-related data collection.</li>
                        <li>All sensitive credentials, including passwords, are stored in encrypted form.</li>
                        <li>The app is used exclusively for the stated purpose of library management.</li>
                    </ul>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">Changes to This Privacy Policy</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        We may update this Privacy Policy from time to time to reflect changes in our practices or for legal
                        and regulatory reasons. Any changes will be posted on this page with an updated revision date.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-slate-900">Contact Us</h2>
                    <p className="mt-3 text-slate-600 leading-7">
                        If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please
                        contact us at{' '}
                        <a href="mailto:biharilibrary@gmail.com" className="font-medium text-slate-900 underline">
                            biharilibrary@gmail.com
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    )
}