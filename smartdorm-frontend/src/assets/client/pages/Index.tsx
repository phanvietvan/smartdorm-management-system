import { useState } from "react";

export default function Index() {
  const [email, setEmail] = useState("");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign up
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-poppins overflow-hidden">
      {/* Left Panel - Background image section */}
      <div className="relative flex-1 min-h-[45vh] md:min-h-screen overflow-hidden">
        {/* Background Image */}
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/21a2a268ebfaea40a0385103f1debef5628189ae?width=1864"
          alt="SmartDorm smart home illustration"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Logo - top left */}
        <div className="absolute top-6 left-10 z-10">
          <SmartDormLogo />
        </div>

        {/* Welcome text - bottom left */}
        <div className="absolute bottom-8 left-10 z-10">
          <p className="text-black font-bold uppercase leading-tight" style={{ fontSize: "clamp(28px, 4vw, 51px)", lineHeight: "1.05" }}>
            Welcome to
          </p>
          <p className="font-bold uppercase text-[#59C1DE]" style={{ fontSize: "clamp(28px, 4vw, 51px)", lineHeight: "1.05" }}>
            SmartDorm
          </p>
        </div>

        {/* Bottom fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#727272] to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Right Panel - Sign in form */}
      <div className="w-full md:w-[45%] lg:w-[42%] bg-[#727272] flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 md:py-0 min-h-[55vh] md:min-h-screen">
        {/* Title */}
        <h1
          className="text-black font-bold leading-none mb-6"
          style={{ fontSize: "clamp(40px, 6vw, 78px)" }}
        >
          SIGN IN
        </h1>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          {/* Subtitle */}
          <p className="text-black font-bold text-[15px]">
            Sign in with email address
          </p>

          {/* Email Input */}
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A4A4A4]">
              <EmailIcon />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Yourname@gmail.com"
              className="w-full h-[62px] rounded-[10px] bg-white pl-14 pr-5 text-[16px] font-medium text-gray-700 placeholder-[#A4A4A4] outline-none shadow-[inset_0_0_11px_0_rgba(0,0,0,0.16)] focus:ring-2 focus:ring-[#59C1DE]"
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full h-[58px] rounded-[19px] font-medium text-[22px] text-black transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: "linear-gradient(90deg, #FFF 0.03%, #A4A4A4 101.88%)" }}
          >
            Sign up
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-[#727272] opacity-60" />
          <span className="text-[#B6B6B6] font-semibold text-[13px] whitespace-nowrap">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-[#727272] opacity-60" />
        </div>

        {/* Social Buttons */}
        <div className="flex gap-4">
          {/* Google Button */}
          <button className="flex-1 h-[45px] rounded-[11px] bg-white flex items-center justify-center gap-3 font-semibold text-[15px] text-black transition-opacity hover:opacity-90 active:opacity-80">
            <GoogleIcon />
            Google
          </button>

          {/* Facebook Button */}
          <button className="flex-1 h-[45px] rounded-[11px] bg-white flex items-center justify-center gap-3 font-semibold text-[15px] text-black transition-opacity hover:opacity-90 active:opacity-80">
            <FacebookIcon />
            Facebook
          </button>
        </div>

        {/* Terms */}
        <p className="mt-5 text-[12px] font-medium text-[#B6B6B6]">
          By registering you with our{" "}
          <span className="text-black font-medium cursor-pointer hover:underline">
            Terms and Conditions
          </span>
        </p>
      </div>
    </div>
  );
}

function SmartDormLogo() {
  return (
    <svg width="197" height="46" viewBox="0 0 197 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text fill="white" style={{ whiteSpace: "pre" }} fontFamily="Poppins, sans-serif" fontSize="25.1373" fontWeight="bold" letterSpacing="0em">
        <tspan x="44.2557" y="27.798">SmartDorm </tspan>
      </text>
      <text fill="white" style={{ whiteSpace: "pre" }} fontFamily="Poppins, sans-serif" fontSize="10.3854" letterSpacing="0.6em">
        <tspan x="82.6108" y="41.1387">MEMON</tspan>
      </text>
      <path d="M0 7.37598H26.8561" stroke="white" strokeWidth="3.06926" />
      <path d="M0 36.9573H26.8561" stroke="white" strokeWidth="3.06926" />
      <path d="M16.4495 7.37598L5.37134 21.8227L16.4495 37.3013" stroke="white" strokeWidth="3.06926" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="26" height="19" viewBox="0 0 26 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.95812 0H21.11C22.1598 0 23.1665 0.396165 23.9088 1.10134C24.6511 1.80652 25.0681 2.76295 25.0681 3.76022V15.0409C25.0681 16.0381 24.6511 16.9946 23.9088 17.6997C23.1665 18.4049 22.1598 18.8011 21.11 18.8011H3.95812C2.90836 18.8011 1.9016 18.4049 1.15931 17.6997C0.417016 16.9946 0 16.0381 0 15.0409V3.76022C0 2.76295 0.417016 1.80652 1.15931 1.10134C1.9016 0.396165 2.90836 0 3.95812 0ZM3.95812 1.25341C3.29844 1.25341 2.71791 1.46648 2.26932 1.84251L12.5341 8.14714L22.7988 1.84251C22.3502 1.46648 21.7697 1.25341 21.11 1.25341H3.95812ZM12.5341 9.66376L1.49089 2.85777C1.38534 3.13352 1.31937 3.44687 1.31937 3.76022V15.0409C1.31937 15.7057 1.59738 16.3433 2.09225 16.8135C2.58711 17.2836 3.25828 17.5477 3.95812 17.5477H21.11C21.8098 17.5477 22.481 17.2836 22.9759 16.8135C23.4707 16.3433 23.7487 15.7057 23.7487 15.0409V3.76022C23.7487 3.44687 23.6828 3.13352 23.5772 2.85777L12.5341 9.66376Z" fill="#A4A4A4" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.3417 7.98524H26.5845V7.94377H18.124V11.9408H23.4367C22.6616 14.2675 20.5789 15.9378 18.124 15.9378C15.0091 15.9378 12.4836 13.2533 12.4836 9.94227C12.4836 6.63126 15.0091 3.94678 18.124 3.94678C19.5618 3.94678 20.8699 4.52334 21.8659 5.46514L24.5248 2.63876C22.8459 0.975512 20.6001 -0.0502167 18.124 -0.0502167C12.9325 -0.0502167 8.72343 4.42392 8.72343 9.94227C8.72343 15.4606 12.9325 19.9348 18.124 19.9348C23.3154 19.9348 27.5245 15.4606 27.5245 9.94227C27.5245 9.27227 27.4597 8.61827 27.3417 7.98524Z" fill="#FFC107" />
      <path d="M18.124 19.9347C20.5522 19.9347 22.7585 18.9469 24.4266 17.3407L21.5171 14.7236C20.5416 15.5122 19.3496 15.9387 18.124 15.9377C15.6789 15.9377 13.6028 14.2805 12.8207 11.9677L9.75517 14.4783C11.311 17.7144 14.4705 19.9347 18.124 19.9347Z" fill="#4CAF50" />
      <path d="M27.3417 7.98529H26.5844V7.94382H18.124V11.9408H23.4367C23.0659 13.0482 22.3981 14.0158 21.5157 14.7242L21.5171 14.7232L24.4266 17.3403C24.2207 17.5391 27.5245 14.9386 27.5245 9.94231C27.5245 9.27232 27.4596 8.61831 27.3417 7.98529Z" fill="#59C1DE" />
      <path d="M9.80726 5.29127L12.8958 7.69896C13.7315 5.49961 15.7555 3.94678 18.1239 3.94678C19.5617 3.94678 20.8698 4.52334 21.8658 5.46514L24.5248 2.63876C22.8458 0.975512 20.6 -0.0502167 18.1239 -0.0502167C14.5132 -0.0502167 11.3819 2.11665 9.80726 5.29127Z" fill="#FF3D00" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11.2807" cy="11.2807" r="11.2807" fill="#0A66C2" />
      <path d="M12.5314 18.7408V12.2505H14.71L15.0362 9.7212H12.5314V8.10624C12.5314 7.37391 12.7349 6.87485 13.785 6.87485L15.1244 6.87426V4.61202C14.8927 4.58119 14.0976 4.51231 13.1727 4.51231C11.2415 4.51231 9.91947 5.69106 9.91947 7.85582V9.7212H7.73534V12.2505H9.91947V18.7408H12.5314Z" fill="white" />
    </svg>
  );
}
