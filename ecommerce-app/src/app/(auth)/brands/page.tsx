"use client"
import BrandCreate from "@/components/brandCreate";
import BrandTable from "@/components/brandTable";

export default function BrandsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Brands</h1>
      <BrandCreate
        onBrandAdded={() => {
          window.location.reload();
        }}
      />
      <BrandTable/>
      {/* <BrandList /> */}
    </div>
  );
}
