"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MarketingPage() {
    return (
        <main className="flex-1">
            <HeroSection />
            <FeaturesSection />
            <PricingSection />
            <AboutSection />
            <FAQSection />
            <ContactSection />
            <Footer />
        </main>
    );
}

function HeroSection() {
    return (
        <section className="relative py-32 px-4 text-center bg-gradient-to-b from-secondary to-background">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-5xl md:text-7xl font-light tracking-tight">
                    Beautiful Wedding Websites
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Elegant, personalized wedding websites crafted with care.
                    Share your story, manage RSVPs, and create lasting
                    memories—all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="#contact">
                        <Button size="lg" className="px-8">
                            Get Started
                        </Button>
                    </a>
                    <a href="#features">
                        <Button size="lg" variant="outline" className="px-8">
                            Learn More
                        </Button>
                    </a>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    const features = [
        {
            title: "Custom Design",
            description:
                "Choose from beautifully crafted templates and customize colors to match your wedding style.",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
                    />
                </svg>
            ),
        },
        {
            title: "Easy RSVP Management",
            description:
                "Guests can RSVP with a simple code. Track responses and dietary requirements effortlessly.",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                    />
                </svg>
            ),
        },
        {
            title: "Gift Registry",
            description:
                "Connect your registry or use our built-in gift system with secure payments.",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                </svg>
            ),
        },
        {
            title: "Mobile Friendly",
            description:
                "Your wedding website looks stunning on any device—phones, tablets, and desktops.",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                </svg>
            ),
        },
        {
            title: "Guest Communications",
            description:
                "Send reminders and updates to your guests via WhatsApp—all from one dashboard.",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                </svg>
            ),
        },
        {
            title: "Secure & Private",
            description:
                "Your data is protected with enterprise-grade security. Guest access is code-protected.",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <section id="features" className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-light mb-4">
                        Everything You Need
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Our platform provides all the tools to create a
                        beautiful wedding website and manage your big day with
                        ease.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 border rounded-lg space-y-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-medium">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PricingSection() {
    return (
        <section id="pricing" className="py-24 px-4 bg-secondary">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-light mb-4">Simple Pricing</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
                    One package, everything included. No hidden fees, no
                    surprises.
                </p>
                <div className="bg-background border rounded-2xl p-8 md:p-12 max-w-lg mx-auto">
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Wedding Website Package
                            </p>
                            <p className="text-5xl font-light">Contact Us</p>
                            <p className="text-muted-foreground mt-2">
                                for custom pricing
                            </p>
                        </div>
                        <ul className="space-y-3 text-left">
                            {[
                                "Custom subdomain (yournames.braunstud.io)",
                                "Beautiful, responsive design",
                                "RSVP management",
                                "Guest list management",
                                "Gift registry integration",
                                "WhatsApp notifications",
                                "Preview before launch",
                                "Dedicated support",
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <svg
                                        className="w-5 h-5 text-primary flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <a href="#contact">
                            <Button size="lg" className="w-full">
                                Get in Touch
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

function AboutSection() {
    return (
        <section id="about" className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-light">About Us</h2>
                        <p className="text-muted-foreground">
                            We believe every couple deserves a beautiful wedding
                            website that reflects their unique love story. Our
                            team works closely with you to create a personalized
                            digital experience for your special day.
                        </p>
                        <p className="text-muted-foreground">
                            Unlike DIY builders, we handle all the technical
                            details so you can focus on what matters
                            most—celebrating your love with the people who
                            matter most.
                        </p>
                    </div>
                    <div className="bg-secondary rounded-2xl aspect-square flex items-center justify-center">
                        <div className="text-center p-8">
                            <p className="text-6xl font-light mb-4">♥</p>
                            <p className="text-muted-foreground">
                                Crafted with love
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FAQSection() {
    const faqs = [
        {
            question: "How does the process work?",
            answer: "Simply contact us with your details. We'll discuss your vision, create your website, and give you a preview link to review. Once you're happy, we'll launch your site and provide you access to manage guests and RSVPs.",
        },
        {
            question: "Can I customize the design?",
            answer: "Yes! While we work from carefully crafted templates, we can customize colors, content, and sections to match your wedding theme perfectly.",
        },
        {
            question: "How do guests RSVP?",
            answer: "Guests receive a secure code via WhatsApp or SMS. They enter this code on your website to access the RSVP form. This ensures only invited guests can respond.",
        },
        {
            question: "What about gift payments?",
            answer: "You can link to an external registry, or use our built-in gift system where guests can contribute securely. Payments go directly to your connected account.",
        },
        {
            question: "How long does it take to launch?",
            answer: "Most wedding websites are ready within 3-5 business days after we receive your content and preferences.",
        },
    ];

    return (
        <section id="faq" className="py-24 px-4 bg-secondary">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-light text-center mb-12">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-background rounded-lg p-6"
                        >
                            <h3 className="font-medium mb-2">{faq.question}</h3>
                            <p className="text-muted-foreground">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ContactSection() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createLead = useMutation(api.leads.create);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await createLead({
                name,
                email,
                phone: phone || undefined,
                message,
                source: "website_contact",
            });

            setIsSubmitted(true);
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to send message"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-light mb-4">Get in Touch</h2>
                    <p className="text-muted-foreground">
                        Ready to create your wedding website? Send us a message
                        and we&apos;ll get back to you within 24 hours.
                    </p>
                </div>

                {isSubmitted ? (
                    <div className="text-center p-8 border rounded-lg bg-secondary">
                        <div className="text-4xl mb-4">✓</div>
                        <h3 className="text-xl font-medium mb-2">
                            Message Sent!
                        </h3>
                        <p className="text-muted-foreground">
                            Thank you for reaching out. We&apos;ll be in touch
                            soon.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-6"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Send Another Message
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (optional)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message *</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us about your wedding and what you're looking for..."
                                rows={5}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                    </form>
                )}
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="py-12 px-4 border-t">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Braun Studio. All rights
                    reserved.
                </div>
                <nav className="flex gap-6 text-sm text-muted-foreground">
                    <a href="#features" className="hover:text-foreground">
                        Features
                    </a>
                    <a href="#pricing" className="hover:text-foreground">
                        Pricing
                    </a>
                    <a href="#about" className="hover:text-foreground">
                        About
                    </a>
                    <a href="#contact" className="hover:text-foreground">
                        Contact
                    </a>
                </nav>
            </div>
        </footer>
    );
}
