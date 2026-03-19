"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, X } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  fine: any;
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentModal({ fine, onClose, onComplete }: PaymentModalProps) {
  const [step, setStep] = useState<"details" | "payment" | "success">(
    "details"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  const dateOnly = (isoDate: any) =>
    new Date(isoDate).toLocaleDateString("en-IN");

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !paymentData.cardNumber ||
      !paymentData.cardHolder ||
      !paymentData.expiryDate ||
      !paymentData.cvv
    ) {
      alert("Please fill in all payment details");
      return;
    }

    setIsLoading(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setStep("success");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {step === "details" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Fine Amount :</span> ₹
                  {fine.amount}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-bold">Reason :</span> {fine.reason}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-bold">Due Date :</span>{" "}
                  {dateOnly(fine.dueDate)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  You are about to pay{" "}
                  <span className="font-bold text-gray-900">
                    ₹{fine.amount}
                  </span>{" "}
                  for this fine.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gray-300 bg-transparent cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep("payment")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      cardNumber: e.target.value,
                    })
                  }
                  disabled={isLoading}
                  className="border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Holder Name
                </label>
                <Input
                  placeholder="John Doe"
                  value={paymentData.cardHolder}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      cardHolder: e.target.value,
                    })
                  }
                  disabled={isLoading}
                  className="border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <Input
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        expiryDate: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <Input
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, cvv: e.target.value })
                    }
                    disabled={isLoading}
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setStep("details")}
                  variant="outline"
                  className="flex-1 border-gray-300 bg-transparent"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${fine.amount}`
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Payment Successful!
              </h3>
              <p className="text-gray-600">
                Your payment of{" "}
                <span className="font-bold">₹{fine.amount}</span> has been
                processed successfully.
              </p>
              <p className="text-sm text-gray-500">
                Transaction ID: TXN
                {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
              <Button
                onClick={onComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
