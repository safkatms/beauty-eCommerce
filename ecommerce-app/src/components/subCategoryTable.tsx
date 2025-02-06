import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Define Category and SubCategory interfaces
interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;  // Link the subcategory to a category
}

const SubCategoryTable = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await fetch("/api/categories");
        const categoryData = await categoryResponse.json();
        setCategories(categoryData);

        const subCategoryResponse = await fetch("/api/subCategories");
        const subCategoryData = await subCategoryResponse.json();
        setSubCategories(subCategoryData);
      } catch (error) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/subCategories/delete/${id}`, { method: "DELETE" });

        if (!response.ok) throw new Error("Failed to delete subcategory");

        setSubCategories((prev) => prev.filter((subCategory) => subCategory.id !== id));
        toast.success("Subcategory deleted successfully!");
      } catch (error) {
        toast.error("Error deleting subcategory");
      }
    }
  };

  const columns: ColumnDef<SubCategory>[] = [
    { accessorKey: "id", header: "ID", sortingFn: "alphanumeric" },
    { accessorKey: "name", header: "SubCategory Name", sortingFn: "text" },
    {
      accessorKey: "categoryId", 
      header: "Category", 
      cell: ({ row }) => {
        const category = categories.find(cat => cat.id === row.original.categoryId);
        return category ? category.name : "Unknown";
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => handleDelete(row.original.id)}
          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 flex items-center justify-center"
          disabled={loading}
        >
          <Trash2 size={18} />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: subCategories,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full"
        />
        <p className="mt-3 text-lg text-gray-600 font-semibold animate-pulse">
          Fetching subcategories, please wait...
        </p>
      </div>
    );

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">SubCategory List</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search subcategories..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-pink-600 text-white sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-left cursor-pointer hover:bg-pink-700 transition-all"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc"
                      ? " 🔼"
                      : header.column.getIsSorted() === "desc"
                      ? " 🔽"
                      : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-100 transition">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 border">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                  No subcategories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
          Previous
        </button>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
          Next
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SubCategoryTable;
