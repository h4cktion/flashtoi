"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrderWithDetails } from "@/lib/actions/admin";

interface ExportPDFButtonProps {
  schoolName: string;
  schoolId: string;
  orders: OrderWithDetails[];
  totalRevenue: number;
  paidRevenue: number;
  schoolPayment: number;
  paidOrders: number;
  pendingOrders: number;
}

export function ExportPDFButton({
  schoolName,
  orders,
  totalRevenue,
  paidRevenue,
  schoolPayment,
  paidOrders,
  pendingOrders,
}: ExportPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const generatePDF = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // En-tête
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Récapitulatif des commandes", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(schoolName, pageWidth / 2, 30, { align: "center" });
      
      doc.setFontSize(10);
      doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, pageWidth / 2, 37, { align: "center" });

      // Statistiques
      let yPos = 50;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Statistiques", 14, yPos);
      
      yPos += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const stats = [
        ["Chiffre d'affaires total", formatCurrency(totalRevenue)],
        ["Commandes payées", `${paidOrders}`],
        ["Commandes en attente", `${pendingOrders}`],
        ["", ""],
        ["Revenu des commandes payées", formatCurrency(paidRevenue)],
        ["Montant à payer à l'école (30%)", formatCurrency(schoolPayment)],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: stats,
        theme: "plain",
        styles: {
          fontSize: 11,
          cellPadding: 2,
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 80 },
          1: { halign: "right" },
        },
        didParseCell: (data: any) => {
          // Highlight the school payment row
          if (data.row.index === 5) {
            data.cell.styles.fillColor = [220, 252, 231]; // Light green
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = 12;
          }
          // Empty row
          if (data.row.index === 3) {
            data.cell.styles.minCellHeight = 5;
          }
        },
      });

      // Liste des commandes payées
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Détail des commandes payées", 14, yPos);
      
      yPos += 5;

      const paidOrdersList = orders.filter((o) => o.status === "paid");
      
      if (paidOrdersList.length > 0) {
        const orderData = paidOrdersList.map((order) => [
          order.orderNumber,
          formatDate(order.createdAt),
          order.studentNames.join(", "),
          order.paymentMethod === "online" ? "CB" : order.paymentMethod === "check" ? "Chèque" : "Espèces",
          formatCurrency(order.totalAmount),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["N° Commande", "Date", "Élèves", "Paiement", "Montant"]],
          body: orderData,
          theme: "striped",
          headStyles: {
            fillColor: [79, 70, 229], // Indigo
            textColor: 255,
            fontStyle: "bold",
          },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 25 },
            2: { cellWidth: 60 },
            3: { cellWidth: 25 },
            4: { cellWidth: 30, halign: "right" },
          },
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("Aucune commande payée", 14, yPos + 10);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Page ${i} sur ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Télécharger le PDF
      const fileName = `commandes_${schoolName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {isGenerating ? "Génération..." : "Exporter PDF"}
    </button>
  );
}
