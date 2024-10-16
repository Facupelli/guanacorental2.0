"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Dispatch, type SetStateAction, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DialogFooter } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Loader2 } from "lucide-react";
import DialogWithState from "@components/DialogWithState";
import { validationAddress } from "~/lib/validation";
import { getIsAdmin } from "~/lib/utils";
import { trpc } from "~/trpc/client";
import { CldUploadWidget } from "next-cloudinary";

type NewUserFormData = {
  email?: string;
  full_name: string;
  company: string;
  phone: string;
  province: string;
  city: string;
  address_1: string;
  dni_number: string;
  birth_date: string;
  occupation: string;
  student: boolean;
  employee: boolean;
  cuit: string;
  bank: string;
  alias: string;
  cbu: string;
  bussiness_name: string;
  contact_1: string;
  contact_2: string;
  bond_1: string;
  bond_2: string;
};

export default function ClientNewUserPage() {
  const { data: session } = useSession();
  const { register, handleSubmit } = useForm<NewUserFormData>({
    resolver: zodResolver(validationAddress),
  });

  const divRef = useRef<HTMLDivElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [dniFront, setDniFront] = useState("");
  const [dniBack, setDniBack] = useState("");
  const [dniError, setDniError] = useState("");

  useEffect(() => {
    setShowModal(true);
  }, []);

  const { isPending, mutate } = trpc.user.createUserAddress.useMutation();

  const onSubmit = (data: NewUserFormData) => {
    if (!session?.user.id) return;

    if (!dniBack || !dniFront) {
      setDniError("Las fotos del dni son obligatorias");
      if (divRef.current) {
        divRef.current.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    mutate(
      { ...data, userId: session?.user.id, dniBack, dniFront },
      {
        onSuccess: () => {
          setDniError("");
          setShowSuccessModal(true);
        },
        onError: (err) => {
          console.log("error", err);
        },
      }
    );
  };

  const isAdmin = getIsAdmin(session);

  return (
    <>
      <ImportanModal showModal={showModal} setShowModal={setShowModal} />
      <SuccessModal showSuccessModal={showSuccessModal} setShowSuccessModal={setShowSuccessModal} />

      <h1 className="mt-12 text-3xl font-bold">Formulario Alta de Cliente</h1>

      <section className="max-w-xl py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          {isAdmin && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input className="bg-white" id="email" type="email" placeholder="juan@gmail.com" {...register("email")} />
              <p className="pt-1 text-sm text-primary/60">
                si la cuenta va a ser usada luego por el usuario deben usar el email asociado con su centa de facebook o
                google
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              className="bg-white"
              id="fullName"
              type="text"
              placeholder="Juan Perez"
              {...register("full_name")}
              defaultValue={session?.user.name as string}
            />
          </div>

          <div>
            <Label htmlFor="phone">Número de celular (código de área + número)</Label>
            <Input id="phone" className="bg-white" type="text" placeholder="264 7433664" {...register("phone")} />
          </div>

          <div>
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Input id="birthDate" className="bg-white" type="date" {...register("birth_date")} />
          </div>

          <div>
            <Label htmlFor="dni">DNI (sin puntos)</Label>
            <Input id="dni" className="bg-white" type="text" placeholder="42345678" {...register("dni_number")} />
          </div>

          <div className="grid scroll-my-[150px] grid-cols-2 gap-x-8 gap-y-2" ref={divRef}>
            <div className="grid gap-2">
              <Label>Foto de tu DNI frente (5mb max)</Label>
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(results) => {
                  if (results.event === "success" && results.info && typeof results.info !== "string") {
                    setDniFront(results.info.secure_url);
                  }
                }}
              >
                {({ open }) => {
                  return (
                    <Button size="sm" type="button" onClick={() => open()}>
                      {dniFront ? "Archivo cargado" : "Subir archvio"}
                    </Button>
                  );
                }}
              </CldUploadWidget>
            </div>

            <div className="grid gap-2">
              <Label>Foto de tu DNI reverso (5mb max)</Label>
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(results) => {
                  if (results.event === "success" && results.info && typeof results.info !== "string") {
                    setDniBack(results.info.secure_url);
                  }
                }}
              >
                {({ open }) => {
                  return (
                    <Button size="sm" type="button" onClick={() => open()}>
                      {dniBack ? "Archivo cargado" : "Subir archvio"}
                    </Button>
                  );
                }}
              </CldUploadWidget>
            </div>

            <p className="col-span-2 text-red-600">{dniError}</p>
          </div>

          <div>
            <Label htmlFor="address">Domicilio Real</Label>
            <Input
              className="bg-white"
              type="text"
              placeholder="Los Cedros 4325 sur"
              id="address"
              {...register("address_1")}
            />
          </div>

          <div>
            <Label htmlFor="province">Provincia</Label>
            <Input id="province" className="bg-white" type="text" placeholder="San Juan" {...register("province")} />
          </div>

          <div>
            <Label htmlFor="city">Localidad</Label>
            <Input id="city" className="bg-white" type="text" placeholder="Rivadavia" {...register("city")} />
          </div>

          <div>
            <Label htmlFor="ocupation">Ocupación</Label>
            <Input id="ocupation" className="bg-white" type="text" {...register("occupation")} />
          </div>

          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" className="bg-white" type="text" {...register("company")} />
          </div>

          <div>
            <Label htmlFor="cuit">CUIT</Label>
            <Input id="cuit" className="bg-white" type="text" {...register("cuit")} />
          </div>

          <div>
            <Label htmlFor="razon-social">Razón Social</Label>
            <Input id="razon-social" className="bg-white" type="text" {...register("bussiness_name")} />
          </div>

          <div className="grid gap-2 ">
            <h2 className="text-xl font-semibold">Contactos Relacionados</h2>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center ">
                <Label htmlFor="contact_1">Contacto 1</Label>
                <Input id="contact_1" className="col-span-2 bg-white" type="text" {...register("contact_1")} />
              </div>

              <div className="grid grid-cols-3 items-center ">
                <Label htmlFor="bond_1">Vínculo 1</Label>
                <Input id="bond_1" className="col-span-2 bg-white" type="text" {...register("bond_1")} />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center ">
                <Label htmlFor="contac_2">Contacto 2</Label>
                <Input id="contac_2" className="col-span-2 bg-white" type="text" {...register("contact_2")} />
              </div>
              <div className="grid grid-cols-3 items-center ">
                <Label htmlFor="bond_2">Vínculo 2</Label>
                <Input id="bond_2" className="col-span-2 bg-white" type="text" {...register("bond_2")} />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <h2 className="text-xl font-semibold">Datos Cuenta Bancaria / Mercadopago</h2>

            <div>
              <Label htmlFor="bank">Banco</Label>
              <Input id="bank" className="bg-white" type="text" {...register("bank")} />
            </div>

            <div>
              <Label htmlFor="alias">Alias</Label>
              <Input id="alias" className="bg-white" type="text" {...register("alias")} />
            </div>

            <div>
              <Label htmlFor="cbu">CBU/CVU</Label>
              <Input id="cbu" className="bg-white" type="text" {...register("cbu")} />
            </div>
          </div>

          <Button className="font-semibold" type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar"}
          </Button>
        </form>
      </section>
    </>
  );
}

type ImportanModalProps = {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

const ImportanModal = ({ showModal, setShowModal }: ImportanModalProps) => {
  return (
    <DialogWithState isOpen={showModal} setOpen={setShowModal} title="AVISO IMPORTANTE">
      <div className="grid gap-4 py-4">
        Para poder alquilar equipos es necesario llenar este formulario de alta de cliente. Una vez aprobado (puede
        demorar hasta 48hs) podras realizar tus reservas a través de la web.
      </div>
      <DialogFooter>
        <Button onClick={() => setShowModal(false)}>Aceptar</Button>
      </DialogFooter>
    </DialogWithState>
  );
};

type SuccessModalProps = {
  showSuccessModal: boolean;
  setShowSuccessModal: Dispatch<SetStateAction<boolean>>;
};

const SuccessModal = ({ showSuccessModal, setShowSuccessModal }: SuccessModalProps) => {
  const router = useRouter();

  const handleNext = () => {
    void router.push("/");
    setShowSuccessModal(false);
  };

  return (
    <DialogWithState isOpen={showSuccessModal} setOpen={setShowSuccessModal} title="">
      <div className="grid gap-4 py-4">
        El alta fue enviada correctamente. Puede demorar hasta 48hs para aprobarla o denegarla. Te notificaremos via
        email.
      </div>
      <DialogFooter>
        <Button onClick={handleNext} type="submit">
          OK
        </Button>
      </DialogFooter>
    </DialogWithState>
  );
};
