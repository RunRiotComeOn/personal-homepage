import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Github, Gamepad2, Twitter, Send, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  {
    name: 'Email',
    href: 'mailto:yixuhuang23@m.fudan.edu.cn',
    icon: Mail,
    color: 'hover:bg-red-50 hover:text-red-600 hover:border-red-200',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/RunRiotComeOn',
    icon: Github,
    color: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200',
  },
  {
    name: 'Itch.io',
    href: 'https://yxsophie.itch.io',
    icon: Gamepad2,
    color: 'hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200',
  },
  {
    name: 'X',
    href: 'https://x.com/YixuHuang342',
    icon: Twitter,
    color: 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200',
  },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.contact-title',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Subtitle word-by-word
      gsap.fromTo(
        '.contact-subtitle',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.3,
        }
      );

      // Social links
      gsap.fromTo(
        '.social-link-item',
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
          delay: 0.5,
        }
      );

      // Floating decorations
      gsap.to('.contact-float-1', {
        y: -15,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      
      gsap.to('.contact-float-2', {
        y: 15,
        duration: 5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    // 表单验证
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill in all fields.');
      return;
    }

    // 简单的邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      // 从环境变量读取 EmailJS 配置
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // 检查配置是否存在
      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS configuration is missing. Please set up your .env file.');
      }

      console.log('Sending email with config:', {
        serviceId,
        templateId,
        publicKey: publicKey.substring(0, 5) + '...',
      });

      const result = await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'yixuhuang23@m.fudan.edu.cn',
          reply_to: formData.email,
        },
        publicKey
      );

      console.log('EmailJS result:', result);

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });

      // 3秒后重置状态
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error: any) {
      console.error('EmailJS error:', error);
      console.error('Error details:', {
        text: error?.text,
        status: error?.status,
        message: error?.message,
      });

      setStatus('error');

      // 根据错误类型提供更详细的错误信息
      if (error?.status === 400) {
        setErrorMessage('Invalid request. Please check your EmailJS template configuration.');
      } else if (error?.status === 401 || error?.status === 403) {
        setErrorMessage('Authentication failed. Please check your EmailJS Public Key.');
      } else if (error?.text) {
        setErrorMessage(`Failed to send: ${error.text}`);
      } else {
        setErrorMessage('Failed to send message. Please check the console for details or contact me directly via email.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Floating decorations */}
      <div className="contact-float-1 absolute top-20 left-10 w-24 h-24 bg-[#343a40]/5 rounded-full blur-2xl" />
      <div className="contact-float-2 absolute bottom-20 right-10 w-32 h-32 bg-[#6c757d]/5 rounded-full blur-2xl" />
      <div className="contact-float-1 absolute top-1/2 left-1/4 w-16 h-16 bg-[#adb5bd]/5 rounded-full blur-xl" style={{ animationDelay: '2s' }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="contact-title font-serif text-4xl lg:text-5xl font-bold text-[#343a40] mb-4">
            Get In Touch
          </h2>
          <p className="contact-subtitle text-lg text-[#6c757d] max-w-xl mx-auto">
            I am always interested in discussing research collaborations, potential projects, 
            or opportunities in AI and machine learning.
          </p>
        </div>

        {/* Contact form */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-[#dee2e6] mb-10">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#495057] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  disabled={status === 'sending'}
                  className="w-full px-4 py-3 rounded-lg border border-[#dee2e6] focus:border-[#343a40] focus:ring-2 focus:ring-[#343a40]/10 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#495057] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  disabled={status === 'sending'}
                  className="w-full px-4 py-3 rounded-lg border border-[#dee2e6] focus:border-[#343a40] focus:ring-2 focus:ring-[#343a40]/10 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                placeholder="Your message..."
                disabled={status === 'sending'}
                className="w-full px-4 py-3 rounded-lg border border-[#dee2e6] focus:border-[#343a40] focus:ring-2 focus:ring-[#343a40]/10 outline-none transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Status messages */}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                <CheckCircle size={20} />
                <span>Message sent successfully! I'll get back to you soon.</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                <AlertCircle size={20} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full sm:w-auto px-8 py-3 bg-[#343a40] text-white rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Social links */}
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-link-item flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-[#dee2e6] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${link.color}`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.name}</span>
              </a>
            );
          })}
        </div>

        {/* Response time note */}
        <p className="text-center text-sm text-[#6c757d] mt-8">
          I typically respond within 24-48 hours on business days.
        </p>
      </div>
    </section>
  );
}
