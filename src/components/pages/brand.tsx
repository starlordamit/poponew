import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import BrandDetail from "../brands/BrandDetail";

const BrandPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <DashboardLayout activeItem="Brands">
        <div className="text-center py-10">
          <p>Brand ID is required.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeItem="Brands">
      <BrandDetail id={id} />
    </DashboardLayout>
  );
};

export default BrandPage;
