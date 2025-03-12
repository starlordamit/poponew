import React from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import BrandList from "../brands/BrandList";

const BrandsPage = () => {
  return (
    <DashboardLayout activeItem="Brands">
      <BrandList />
    </DashboardLayout>
  );
};

export default BrandsPage;
