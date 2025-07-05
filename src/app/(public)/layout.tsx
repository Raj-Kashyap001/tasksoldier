import AppFooter from "@/components/app-footer";
import AppNavbar from "@/components/app-navbar";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppNavbar />
      <div className="w-full h-full flex items-center justify-center">
        {children}
      </div>
      <AppFooter />
    </>
  );
};
export default LandingLayout;
