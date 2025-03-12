import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PaymentSlipProps {
  influencerName: string;
  videoUrl: string;
  creatorPrice: number;
  reimbursementTotal: number;
  totalPayable: number;
  totalPaidAmount: number;
  transactions: any[];
}

const PaymentSlip = ({
  influencerName,
  videoUrl,
  creatorPrice,
  reimbursementTotal,
  totalPayable,
  totalPaidAmount,
  transactions,
}: PaymentSlipProps) => {
  const slipRef = React.useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!slipRef.current) return;

    try {
      // Force the hidden div to be rendered for html2canvas
      const hiddenDiv = slipRef.current.parentElement;
      if (hiddenDiv) {
        const originalDisplay = hiddenDiv.style.display;
        hiddenDiv.style.display = "block";
        hiddenDiv.style.position = "fixed";
        hiddenDiv.style.top = "-9999px";
        hiddenDiv.style.left = "-9999px";

        // Wait for the DOM to update
        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(slipRef.current, {
          scale: 2,
          backgroundColor: "#1a1a1a",
          logging: true,
          useCORS: true,
          allowTaint: true,
        });

        // Restore original display style
        hiddenDiv.style.display = originalDisplay;
        hiddenDiv.style.position = "";
        hiddenDiv.style.top = "";
        hiddenDiv.style.left = "";

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [80, 150], // Receipt-like dimensions
        });

        const imgWidth = 70;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
        pdf.save(`payment_slip_${influencerName.replace(/\s+/g, "_")}.pdf`);
      }
    } catch (error) {
      console.error("Error generating payment slip:", error);
      alert(
        "There was an error generating the payment slip. Please try again.",
      );
    }
  };

  return (
    <div className="mt-2">
      <Button
        variant="outline"
        size="sm"
        className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-0"
        onClick={handleDownload}
      >
        <Download className="mr-2 h-4 w-4" /> Download Payment Slip
      </Button>

      {/* Hidden payment slip template for PDF generation */}
      <div className="hidden" id="payment-slip-container">
        <div
          ref={slipRef}
          className="bg-[#1a1a1a] text-white w-[300px] font-sans overflow-hidden"
        >
          {/* Header with gradient background and logo */}
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://cms.clyromedia.com/uploads/Creators_3436d4ebcf.svg')] bg-center bg-no-repeat bg-contain"></div>
            <img
              src="https://cms.clyromedia.com/uploads/Creators_3436d4ebcf.svg"
              alt="Creators Logo"
              className="h-10 mx-auto relative z-10"
            />
            <div className="text-center mt-2 relative z-10">
              <h3 className="font-bold text-sm tracking-wider">
                PAYMENT RECEIPT
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Content area with subtle pattern */}
          <div className="p-4 bg-opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[length:20px_20px]">
            {/* Creator info with icon */}
            <div className="mb-4 bg-black bg-opacity-20 p-3 rounded-md">
              <p className="text-xs mb-1 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                <span className="font-medium">Creator:</span>{" "}
                <span className="ml-1 text-gray-300">{influencerName}</span>
              </p>
              <p className="text-xs flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  ></path>
                </svg>
                <span className="font-medium">Content:</span>{" "}
                <span className="ml-1 text-gray-300 truncate max-w-[200px] inline-block align-bottom">
                  {videoUrl}
                </span>
              </p>
            </div>

            {/* Financial summary with gradient border */}
            <div className="border-t border-b border-gray-700 py-3 mb-3 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-300">Creator Price:</span>
                <span className="font-medium">₹{creatorPrice.toFixed(2)}</span>
              </div>
              {reimbursementTotal > 0 && (
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-300">Reimbursements:</span>
                  <span className="font-medium">
                    ₹{reimbursementTotal.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold mt-2 pt-2 border-t border-gray-800">
                <span>Total Payable:</span>
                <span className="text-purple-300">
                  ₹{totalPayable.toFixed(2)}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            </div>

            {/* Payment details with better styling */}
            <div className="mb-4">
              <div className="text-xs font-bold mb-2 pb-1 border-b border-gray-800 text-purple-300">
                Payment Details:
              </div>
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="text-xs mb-2 bg-black bg-opacity-20 p-2 rounded-md"
                >
                  <div className="flex justify-between font-medium">
                    <span>
                      {transaction.reference || `Payment ${index + 1}`}
                    </span>
                    <span>
                      ₹{transaction.total_amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  {(transaction.tds_amount > 0 ||
                    transaction.agency_fees_amount > 0) && (
                    <div className="mt-1 pt-1 border-t border-gray-800">
                      {transaction.tds_amount > 0 && (
                        <div className="flex justify-between pl-2 text-gray-400">
                          <span>TDS ({transaction.tds_rate}%):</span>
                          <span>-₹{transaction.tds_amount.toFixed(2)}</span>
                        </div>
                      )}
                      {transaction.agency_fees_amount > 0 && (
                        <div className="flex justify-between pl-2 text-gray-400">
                          <span>Agency ({transaction.agency_fees_rate}%):</span>
                          <span>
                            -₹{transaction.agency_fees_amount.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total summary with highlight */}
            <div className="border-t border-gray-700 pt-3 mb-4 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Total Paid:</span>
                <span className="text-purple-300">
                  ₹{totalPaidAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Payment Status:</span>
                <span
                  className={
                    totalPaidAmount >= totalPayable
                      ? "text-green-400 font-medium"
                      : "text-yellow-400 font-medium"
                  }
                >
                  {totalPaidAmount >= totalPayable ? "PAID" : "PARTIAL"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer with gradient */}
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-3 text-center">
            <p className="text-xs text-gray-300">
              Thank you for your collaboration!
            </p>
            <p className="mt-1 text-xs text-gray-400">
              © {new Date().getFullYear()} Creators
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSlip;
