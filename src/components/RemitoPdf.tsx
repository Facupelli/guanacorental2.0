import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { formatPrice } from "@/lib/utils";
import type {
  BookOnEquipment,
  Equipment,
  EquipmentOnOwner,
  Owner,
  Prisma,
} from "@prisma/client";
import { toArgentinaDate } from "@/lib/dates";

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: 700,
    },
  ],
});

const MyDocument = Document;
const MyPage = Page;

const styles = StyleSheet.create({
  page: {
    fontSize: 12,
    fontFamily: "Open Sans",
    position: "relative",
    zIndex: 0,
  },
  imageWrapper: {
    position: "absolute",
    width: 125,
    height: 125,
    left: "50%",
    top: 5,
    transform: "translate(-50%, 0%)",
    padding: "0px 5px",
    backgroundColor: "white",
  },
  pageMargin: {
    position: "absolute",
    top: 65,
    left: "4%",
    zIndex: -1,
    height: "88%",
    width: "92%",
    border: "2px solid black",
    borderRadius: 10,
  },
  userSection: {
    borderBottom: "2px solid black",
    padding: 20,
    marginTop: 25,
    marginLeft: 25,
    marginRight: 25,
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "3px 0",
  },
  flexItem: {
    flexBasis: "50%",
  },
  equipmentWrapper: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginLeft: 25,
    marginRight: 25,
    paddingLeft: 20,
    paddingRight: 20,
  },
  equipment: {
    marginTop: 5,
    marginBottom: 5,
    fontSize: 11,
    flexBasis: "46%",
    marginRight: "4%",
  },
  bold: {
    fontWeight: 600,
  },
  accessories: {
    fontSize: 8,
    paddingLeft: 2,
  },
  equiposRetirados: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 5,
    fontWeight: 700,
    marginLeft: 25,
  },
  breakMargin: {
    marginTop: 75,
  },
  bgImageWrapper: {
    width: "92%",
    height: 450,
    position: "absolute",
    zIndex: 0,
    top: "35%",
    left: 25,
    opacity: 0.2,
  },
  bgImage: {
    width: "100%",
    objectFit: "contain",
    marginLeft: "auto",
    marginRight: "auto",
  },
  bottomSigns: {
    position: "absolute",
    bottom: 0,
    left: 25,
    width: "92%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    padding: "15px 0px",
    marginBottom: 30,
    paddingLeft: 20,
    paddingRight: 20,
  },
  signs: {
    borderTop: "1px solid black",
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  number: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 50,
    marginRight: 25,
    fontSize: 10,
    paddingBottom: 10,
  },
  bottomPage: {
    position: "absolute",
    bottom: 20,
    left: 25,
    fontSize: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    width: "92%",
    paddingTop: 6,
  },
  anexoList: {
    marginLeft: 35,
    marginRight: 35,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 35,
    fontSize: 9,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    color: "#292929",
  },
});

type Order = Prisma.OrderGetPayload<{
  include: {
    customer: {
      include: { address: true };
    };
    location: true;
    book: true;
    equipments: {
      include: { books: true; equipment: true; owner: true };
    };
  };
}>;

type Props = {
  order: Order;
  pdfEquipmentRows?: (EquipmentOnOwner & {
    owner: Owner;
    equipment: Equipment;
    books: BookOnEquipment[];
  })[][];
};

export const RemitoPdf = ({ order, pdfEquipmentRows }: Props) => (
  <MyDocument>
    <MyPage size="A4" style={styles.page} wrap>
      <View style={styles.number}>
        <Text>
          REMITO N° {order.location.name}-{order.number}
        </Text>
      </View>
      <View style={styles.pageMargin} fixed></View>
      <View style={styles.imageWrapper}>
        <Image src="/remito/logo-remito-low.png" />
      </View>

      <View style={styles.userSection}>
        <View style={styles.flex}>
          <Text>
            FECHA DE RETIRO:{" "}
            <Text style={styles.bold}>
              {toArgentinaDate(order.book.start_date)}
            </Text>
          </Text>
        </View>
        <View style={styles.flex}>
          <Text>
            FECHA DE DEVOLUCIÓN:{" "}
            <Text style={styles.bold}>
              {toArgentinaDate(order.book.end_date)}
            </Text>
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.flexItem}>
            CANTIDAD DE JORNADAS:{" "}
            <Text style={styles.bold}>{order.book.working_days}</Text>
          </Text>
          <Text style={styles.flexItem}>
            PRECIO ACORDADO:{" "}
            <Text style={styles.bold}>{formatPrice(order.total)}</Text>
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.flexItem}>
            RETIRA: <Text style={styles.bold}>{order.customer.name}</Text>
          </Text>
          <Text style={styles.flexItem}>
            DNI:{" "}
            <Text style={styles.bold}>
              {order.customer.address?.dni_number}
            </Text>
          </Text>
        </View>
        <View style={styles.flex}>
          <Text>
            IMPORTANTE: <Text style={styles.bold}>VER CONDICIONES ANEXO I</Text>
          </Text>
        </View>
      </View>

      <View style={styles.bgImageWrapper} fixed>
        <Image src="/remito/guanaco-perfil-low.png" style={styles.bgImage} />
      </View>
      <Text style={styles.equiposRetirados}>LISTA DE EQUIPOS RETIRADOS</Text>

      {pdfEquipmentRows?.map((row, i) => {
        return (
          <View
            key={i}
            break={i === 5 || i === 12}
            style={[
              styles.equipmentWrapper,
              { marginTop: i === 5 || i === 12 ? 85 : 0 },
            ]}
          >
            {row.map((equipmentOwner) => (
              <View key={equipmentOwner.id} style={styles.equipment}>
                <Text style={styles.bold}>
                  x
                  {equipmentOwner.books.reduce((acc, curr) => {
                    return acc + curr.quantity;
                  }, 0)}{" "}
                  {equipmentOwner.equipment.name}{" "}
                  {equipmentOwner.equipment.brand}{" "}
                  {equipmentOwner.equipment.model}
                </Text>
                <Text style={styles.accessories}>
                  {equipmentOwner.equipment.accessories.length > 0
                    ? "Con"
                    : null}{" "}
                  {equipmentOwner.equipment.accessories}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
      <View fixed style={styles.bottomSigns}>
        <Text style={styles.signs}>FIRMA DEL RESPONSABLE DE PRODUCCIÓN</Text>
        <Text style={styles.signs}>FIRMA DEL RESPONSABLE DEl RENTAL</Text>
      </View>
      <View fixed style={styles.bottomPage}>
        <Text>2022. GUANACO RENTAL. SAN JUAN, ARGENTINA.</Text>
        <Text>Telefonos de contacto: 2644162059 - 2644627267</Text>
        <Text>www.guanacorental.com hola@guanacorental.com</Text>
      </View>
    </MyPage>

    <MyPage size="A4" style={styles.page} wrap>
      <View style={styles.number}>
        <Text>ANEXO I</Text>
      </View>
      <View style={styles.pageMargin} fixed></View>
      <View style={styles.imageWrapper}>
        <Image src="/remito/logo-remito-low.png" />
      </View>

      <View style={styles.anexoList}>
        <Text>
          Este anexo tiene como fin establecer las condiciones de alquiler de
          equipos solicitados por el cliente, dejando claras las
          responsabilidades de cada parte, y funcionando como contrato entre las
          partes abajo firmantes.
        </Text>
        <Text>
          1. El responsable del rental se compromete a brindar en alquiler los
          equipos listados en perfectas condiciones funcionales en el periodo de
          fechas establecidas entre retiro y devolución.
        </Text>
        <Text>
          2. El responsable del rental se compromete a asegurar la
          disponibilidad del equipo solicitado y acordado previamente con el
          cliente y a la asistencia técnica por WhatsApp. Esta asistencia está
          reforzada mediante las informaciones técnicas además de la posibilidad
          de establecer contacto vía mail y/o formulario de la web,
          www.guanacorental.com. El servicio de operativa, mantenimiento,
          formación y/o asistencia no está incluída en el alquiler del equipo a
          no ser que se haya solicitado y aplicado al proyecto, presupuesto,
          servicio o evento y facturado.
        </Text>
        <Text>
          3. El cliente retira los equipos y la firma de este contrato
          acompañado del remito es prueba suficiente de conformidad tanto del
          estado de los equipos como de que se retira la cantidad, tipo y
          detalle de equipos listados en el remito.
        </Text>
        <Text>
          4. El/los equipos sólo podrán ser utilizado para filmar dentro de la
          provincia. El traslado eventual y temporario del/los equipos al
          exterior requerirán autorización expresa y escrita del responsable del
          rental.
        </Text>
        <Text>
          5. El cliente no podrá ceder, prestar, subalquilar o de cualquier
          forma compartir o permitir el uso a terceras personas del/los quipos
          alquilados.
        </Text>
        <Text>
          6. El cliente asume el 100% de la responsabilidad sobre los equipos
          retirados, haciéndose cargo de reponer de manera íntegra e inmediata
          el valor total de reposición de cualquier equipamiento dañado parcial
          o totalmente, hurtado o robado. (consultar valores de reposición al
          responsable del rental).
        </Text>
        <Text>
          7. Guanaco Rental (representado por el responsable del rental) trabaja
          con equipos robustos y solventes. No obstante en caso de incidencia,
          la primera opción es contactar con el responsable del rental. El mismo
          dará las soluciones posibles a la situación sujeto a las posibilidades
          y disponibilidades en el momento del incidente.
        </Text>
        <Text>
          8. La contratación de un seguro de filmación para los equipos queda
          totalmente a criterio del cliente, siendo una decisión libre de cada
          producción a menos que por la cantidad o el valor de los equipos
          retirados el responsable del rental crea necesario la contratación
          obligatoria de un seguro. En caso de tener que reclamar la póliza, el
          responsable de producción se hará cargo de cubrir el valor de
          reposición de los equipos de manera inmediata, ya que el responsable
          de rental no recibirá una póliza como válida al momento de reponer
          equipos dañados parcial o totalmente, hurtados o robados.
        </Text>
        <Text>
          9. El precio acordado del alquiler es pagadero al retiro de equipos
          por adelantado en el domicilio del rental, al igual que su devolución.
          En caso de que el responsable del rental crea necesario, se realizara
          el cobro de una seña que se tendrá en cuenta en el precio acordado del
          alquiler.
        </Text>
        <Text>
          10. La devolución de equipos se establece en el apartado FECHA DE
          DEVOLUCIÓN expresado en el remito, con horario límite a las 9am. La
          demora en la devolución del alquiler pactado devengará al cobro de una
          jornada adicional, siguiendo el mismo criterio día tras día hasta la
          devolución. La mora operará en forma automática y sin necesidad de
          requerimiento alguno. Todo ello independientemente de la acción
          judicial que el responsable del rental podrá iniciar reclamando la
          restitución de la cosa por vía ejecutiva.
        </Text>
        <Text>
          11. Para todos los efectos judiciales y extrajudiciales derivados del
          presente contrato, ambas partes se someten a la competencia ordinaria
          de los Tribunales de San Juan para todos los efectos derivados de este
          contrato y renuncian a cualquier otro fuero o jurisdicción que pudiera
          corresponderles.
        </Text>
        <Text>
          SE FIRMA ESTE EJEMPLAR EXPRESANDO CONFORMIDAD DE AMBAS PARTES.
        </Text>
      </View>

      <View fixed style={styles.bottomSigns}>
        <Text style={styles.signs}>FIRMA DEL RESPONSABLE DE PRODUCCIÓN</Text>
        <Text style={styles.signs}>FIRMA DEL RESPONSABLE DEl RENTAL</Text>
      </View>
      <View fixed style={styles.bottomPage}>
        <Text>2022. GUANACO RENTAL. SAN JUAN, ARGENTINA.</Text>
        <Text>Telefonos de contacto: 2644162059 - 2644627267</Text>
        <Text>www.guanacorental.com hola@guanacorental.com</Text>
      </View>
    </MyPage>
  </MyDocument>
);
