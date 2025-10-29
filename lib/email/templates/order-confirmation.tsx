import * as React from "react";

interface OrderConfirmationEmailProps {
  orderNumber: string;
  studentName: string;
  email: string;
  items: Array<{
    format: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  packs: Array<{
    packName: string;
    quantity: number;
    packPrice: number;
    subtotal: number;
    photosCount: number;
  }>;
  totalAmount: number;
  paymentMethod: "cash" | "check" | "online";
  notes?: string;
}

export const OrderConfirmationEmail: React.FC<
  Readonly<OrderConfirmationEmailProps>
> = ({
  orderNumber,
  studentName,
  email,
  items,
  packs,
  totalAmount,
  paymentMethod,
  notes,
}) => {
  const paymentMethodText = {
    cash: "Espèces",
    check: "Chèque",
    online: "En ligne",
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        style={{
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
          color: "#333",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#192F84",
            color: "white",
            padding: "20px",
            textAlign: "center",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <h1 style={{ margin: "0", fontSize: "24px" }}>
            Confirmation de commande
          </h1>
        </div>

        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "0 0 8px 8px",
            border: "1px solid #ddd",
          }}
        >
          <p style={{ fontSize: "16px", marginTop: "0" }}>Bonjour,</p>

          <p>
            Nous avons bien reçu votre commande de photos scolaires pour{" "}
            <strong>{studentName}</strong>.
          </p>

          <div
            style={{
              backgroundColor: "#e3f2fd",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
              Numéro de commande
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#192F84",
              }}
            >
              {orderNumber}
            </p>
          </div>

          <h2
            style={{
              fontSize: "18px",
              borderBottom: "2px solid #192F84",
              paddingBottom: "10px",
            }}
          >
            Détails de la commande
          </h2>

          {/* Packs */}
          {packs.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", color: "#192F84" }}>Packs</h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "10px",
                }}
              >
                <tbody>
                  {packs.map((pack, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "10px 0" }}>
                        <strong>Pack {pack.packName}</strong>
                        <br />
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          {pack.photosCount} photos × {pack.quantity}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 0",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {pack.subtotal.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Photos individuelles */}
          {items.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", color: "#192F84" }}>
                Photos individuelles
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "10px",
                }}
              >
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "10px 0" }}>
                        <strong>{item.format}</strong>
                        <br />
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          {item.unitPrice.toFixed(2)} € × {item.quantity}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 0",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {item.subtotal.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total */}
          <div
            style={{
              backgroundColor: "#192F84",
              color: "white",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ fontSize: "18px", fontWeight: "bold" }}>
                    Total
                  </td>
                  <td
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      textAlign: "right",
                    }}
                  >
                    {totalAmount.toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Paiement */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", color: "#192F84" }}>
              Mode de paiement
            </h3>
            <p style={{ margin: "5px 0", fontSize: "16px" }}>
              <strong>{paymentMethodText[paymentMethod]}</strong>
            </p>
            {paymentMethod === "check" && (
              <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                Merci de remettre le chèque à l&apos;ordre de l&apos;école.
              </p>
            )}
            {paymentMethod === "cash" && (
              <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                Merci de remettre le montant en espèces à l&apos;école.
              </p>
            )}
          </div>

          {/* Notes */}
          {notes && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", color: "#192F84" }}>Notes</h3>
              <p
                style={{
                  margin: "5px 0",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              >
                {notes}
              </p>
            </div>
          )}

          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #ddd",
              fontSize: "14px",
              color: "#666",
            }}
          >
            <p>
              Vous recevrez un email de confirmation lorsque votre commande sera
              prête à être récupérée.
            </p>
            <p style={{ margin: "20px 0 0 0" }}>
              Merci de votre confiance,
              <br />
              <strong>L&apos;équipe Flash Toi</strong>
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "12px",
            color: "#999",
          }}
        >
          <p>
            Cet email a été envoyé à {email}
            <br />
            Si vous avez des questions, n&apos;hésitez pas à nous contacter.
          </p>
        </div>
      </body>
    </html>
  );
};
