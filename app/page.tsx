"use client";

import LoginButtons from "@/components/LoginButtons";
import { PublicRoute } from "@/components/public-route";
import { Card } from "@/components/ui/card";
import { BarChart3, BookOpen, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function LandingPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Navigation Header */}
        <header className="border-b border-blue-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-900">
                MPNMJ Engineering Collage
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-blue-600 transition"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Contact
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
              Fine Management
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
              A comprehensive platform designed for administrators, faculty, and
              students to manage college fines efficiently and transparently.
            </p>
            <LoginButtons />
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Key Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Admin Features */}
            <Card className="p-6 border-blue-200 hover:shadow-lg transition">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Admin Control
              </h4>
              <p className="text-gray-600 text-sm">
                Manage faculty and student credentials, oversee all fines, and
                maintain system integrity.
              </p>
            </Card>

            {/* Faculty Features */}
            <Card className="p-6 border-green-200 hover:shadow-lg transition">
              <Users className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Faculty Tools
              </h4>
              <p className="text-gray-600 text-sm">
                Issue and update fines, track total fines issued, and manage
                student violations.
              </p>
            </Card>

            {/* Student Features */}
            <Card className="p-6 border-purple-200 hover:shadow-lg transition">
              <BookOpen className="w-12 h-12 text-purple-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Student Portal
              </h4>
              <p className="text-gray-600 text-sm">
                View fine history, track payment status, and manage your account
                securely.
              </p>
            </Card>

            {/* Analytics */}
            <Card className="p-6 border-orange-200 hover:shadow-lg transition">
              <BarChart3 className="w-12 h-12 text-orange-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Analytics
              </h4>
              <p className="text-gray-600 text-sm">
                Real-time insights into fine statistics and payment trends
                across the institution.
              </p>
            </Card>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50 rounded-2xl"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            About CollegeFine
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            CollegeFine is a modern, user-friendly platform designed to simplify
            the management of college fines. Our system provides role-based
            access for administrators, faculty, and students, ensuring
            transparency and efficiency in the fine management process.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            With secure authentication, intuitive dashboards, and comprehensive
            reporting tools, CollegeFine helps institutions maintain discipline
            while providing students with clear visibility into their fine
            status and payment options.
          </p>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="border-t border-blue-200 bg-white/80 mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  CollegeFine
                </h4>
                <p className="text-gray-600 text-sm">
                  Fine management for educational institutions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a href="#features" className="hover:text-blue-600">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="hover:text-blue-600">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="hover:text-blue-600">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                <p className="text-gray-600 text-sm">
                  Email:{" "}
                  <Link href="mailto:no.reply.mpnmj@gmail.com" target="_blank">
                    no.reply.mpnmj@gmail.com
                  </Link>
                </p>
                <p className="text-gray-600 text-sm">
                  Phone: +1 (555) 123-4567
                </p>
              </div>
            </div>
            <div className="border-t border-blue-200 pt-8 text-center text-gray-600 text-sm">
              <p>&copy; 2025 CollegeFine. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </PublicRoute>
  );
}
