"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseEnvelopeAnimationReturn } from "@/hooks/useEnvelopeAnimation";

// Form validation schema
const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.email({ message: "Please enter a valid email address" }),
  projectType: z.enum(["website", "app", "interactive", "other"], {
    message: "Please select a project type",
  }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(5000, { message: "Message must be less than 5000 characters" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  envelopeAnimation: UseEnvelopeAnimationReturn;
}

const PROJECT_TYPES = [
  { value: "website", label: "Website" },
  { value: "app", label: "Web Application" },
  { value: "interactive", label: "Interactive Experience" },
  { value: "other", label: "Other" },
] as const;

export function ContactForm({ envelopeAnimation }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  const { triggerWobble, triggerSend, triggerError, setTyping, setFocused, state } =
    envelopeAnimation;

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Trigger send animation
      await triggerSend();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Form submitted:", data);
      reset();
    } catch (error) {
      triggerError();
      console.error("Form submission error:", error);
    }
  };

  const onError = () => {
    triggerError();
  };

  const handleFocus = () => {
    setFocused(true);
    triggerWobble();
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const handleKeyDown = () => {
    setTyping(true);
  };

  const handleKeyUp = () => {
    setTyping(false);
  };

  const inputClasses =
    "w-full rounded-xl border border-glass-border bg-background-secondary/80 px-5 py-4 text-foreground placeholder-foreground-subtle outline-none transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/20";

  const labelClasses = "mb-2 block text-sm font-medium text-foreground-muted";

  const errorClasses = "mt-1 text-sm text-error";

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="flex flex-col gap-5"
    >
      {/* Name Field */}
      <div>
        <label htmlFor="name" className={labelClasses}>
          Name
        </label>
        <input
          {...register("name")}
          id="name"
          type="text"
          placeholder="Your name"
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className={errorClasses} role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className={labelClasses}>
          Email
        </label>
        <input
          {...register("email")}
          id="email"
          type="email"
          placeholder="your@email.com"
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className={errorClasses} role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Project Type Field */}
      <div>
        <label htmlFor="projectType" className={labelClasses}>
          Project Type
        </label>
        <select
          {...register("projectType")}
          id="projectType"
          className={inputClasses + " cursor-pointer appearance-none"}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={!!errors.projectType}
          aria-describedby={errors.projectType ? "projectType-error" : undefined}
          defaultValue=""
        >
          <option value="" disabled>
            Select a project type
          </option>
          {PROJECT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.projectType && (
          <p id="projectType-error" className={errorClasses} role="alert">
            {errors.projectType.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className={labelClasses}>
          Message
        </label>
        <textarea
          {...register("message")}
          id="message"
          placeholder="Tell us about your project..."
          rows={5}
          className={inputClasses + " resize-none"}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className={errorClasses} role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || state.isSending || state.isSent}
        className="group relative mt-2 overflow-hidden rounded-xl border border-glass-border bg-primary px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {state.isSending ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </>
          ) : state.isSent ? (
            <>
              <svg
                className="h-5 w-5"
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
              Message Sent!
            </>
          ) : (
            <>
              Send Message
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </span>
      </button>

      {/* Success Message */}
      {state.isSent && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-center text-success">
          Thank you for reaching out! We&apos;ll get back to you soon.
        </div>
      )}
    </form>
  );
}
