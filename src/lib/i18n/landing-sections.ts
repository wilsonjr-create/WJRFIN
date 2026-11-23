import type { Language } from "@/contexts/LanguageContext";

export type LandingSectionTexts = {
  solutions: {
    label: string;
    title: string;
    highlight: string;
    description: string;
    cards: { title: string; description: string }[];
  };
  pricing: {
    label: string;
    title: string;
    highlight: string;
    description: string;
    workspace: string;
    availability: string;
    workspaceDescription: string;
    features: string[];
  };
  about: {
    label: string;
    title: string;
    highlight: string;
    paragraphs: string[];
    tagline: string;
    button: string;
  };
};

export const landingSectionsTranslations: Partial<
  Record<Language, LandingSectionTexts>
> = {
  en: {
    solutions: {
      label: "SOLUTIONS",
      title: "Clarity in every number.",
      highlight: "Confidence in every decision.",
      description:
        "Bring your financial operations into one refined workspace. From everyday transactions to multiple businesses, WJRFIN gives you the visibility to stay organized and move forward with confidence.",
      cards: [
        {
          title: "Financial Overview",
          description: "A clearer perspective on your business finances.",
        },
        {
          title: "Multi-Company Management",
          description: "Distinct workspaces. One seamless experience.",
        },
        {
          title: "Transaction Control",
          description: "Keep income and expenses organized.",
        },
        {
          title: "Business Organization",
          description: "Manage contacts and financial obligations.",
        },
      ],
    },
    pricing: {
      label: "PRICING",
      title: "A more intelligent way",
      highlight: "to manage your business.",
      description:
        "Experience a financial workspace designed around clarity, simplicity and control.",
      workspace: "WJRFIN Workspace",
      availability: "Pricing to be announced",
      workspaceDescription:
        "Everything you need to bring greater clarity to your business finances.",
      features: [
        "Financial overview",
        "Transaction management",
        "Multiple company workspaces",
      ],
    },
    about: {
      label: "ABOUT WJRFIN",
      title: "Built for clarity.",
      highlight: "Designed for ambition.",
      paragraphs: [
        "WJRFIN was created with a simple vision: make business financial management more intuitive, organized and accessible.",
        "By combining thoughtful design with practical financial tools, we bring greater clarity to the way businesses manage their operations.",
      ],
      tagline: "Less complexity. More perspective.",
      button: "Get Started",
    },
  },
  es: {
    solutions: {
      label: "SOLUCIONES",
      title: "Claridad en cada cifra.",
      highlight: "Confianza en cada decisión.",
      description:
        "Centraliza tus operaciones financieras en un espacio de trabajo sofisticado. Desde las transacciones diarias hasta la gestión de varias empresas, WJRFIN te ofrece la visión que necesitas para avanzar con confianza.",
      cards: [
        {
          title: "Visión Financiera",
          description: "Una perspectiva más clara de las finanzas de tu empresa.",
        },
        {
          title: "Gestión Multiempresa",
          description: "Espacios independientes. Una experiencia integrada.",
        },
        {
          title: "Control de Transacciones",
          description: "Mantén tus ingresos y gastos organizados.",
        },
        {
          title: "Organización Empresarial",
          description: "Gestiona contactos y obligaciones financieras.",
        },
      ],
    },
    pricing: {
      label: "PRECIOS",
      title: "Una forma más inteligente",
      highlight: "de gestionar tu empresa.",
      description:
        "Descubre un espacio financiero diseñado para ofrecer claridad, sencillez y control.",
      workspace: "WJRFIN Workspace",
      availability: "Precios próximamente",
      workspaceDescription:
        "Las herramientas que necesitas para gestionar tus finanzas empresariales con mayor claridad.",
      features: [
        "Visión financiera",
        "Gestión de transacciones",
        "Espacios para varias empresas",
      ],
    },
    about: {
      label: "SOBRE WJRFIN",
      title: "Creado para aportar claridad.",
      highlight: "Diseñado para grandes ambiciones.",
      paragraphs: [
        "WJRFIN nació con una visión sencilla: hacer que la gestión financiera empresarial sea más intuitiva, organizada y accesible.",
        "Combinamos un diseño cuidado con herramientas financieras prácticas para ofrecer una visión más clara de las operaciones de cada empresa.",
      ],
      tagline: "Menos complejidad. Más perspectiva.",
      button: "Empezar ahora",
    },
  },

  "pt-BR": {
    solutions: {
      label: "SOLUÇÕES",
      title: "Clareza em cada número.",
      highlight: "Confiança em cada decisão.",
      description:
        "Centralize suas operações financeiras em um ambiente sofisticado. Das transações diárias à gestão de múltiplas empresas, o WJRFIN oferece a visão necessária para você avançar com confiança.",
      cards: [
        {
          title: "Visão Financeira",
          description: "Uma perspectiva mais clara das finanças do seu negócio.",
        },
        {
          title: "Gestão de Múltiplas Empresas",
          description: "Ambientes independentes. Uma experiência integrada.",
        },
        {
          title: "Controle de Transações",
          description: "Mantenha receitas e despesas organizadas.",
        },
        {
          title: "Organização Empresarial",
          description: "Gerencie contatos e obrigações financeiras.",
        },
      ],
    },
    pricing: {
      label: "PLANOS",
      title: "Uma maneira mais inteligente",
      highlight: "de gerenciar seu negócio.",
      description:
        "Descubra um ambiente financeiro desenvolvido para oferecer clareza, simplicidade e controle.",
      workspace: "WJRFIN Workspace",
      availability: "Preços em breve",
      workspaceDescription:
        "Tudo o que você precisa para ter mais clareza sobre as finanças da sua empresa.",
      features: [
        "Visão financeira",
        "Gestão de transações",
        "Ambientes para múltiplas empresas",
      ],
    },
    about: {
      label: "SOBRE O WJRFIN",
      title: "Criado para oferecer clareza.",
      highlight: "Desenvolvido para grandes ambições.",
      paragraphs: [
        "O WJRFIN nasceu de uma visão simples: tornar a gestão financeira empresarial mais intuitiva, organizada e acessível.",
        "Ao combinar um design cuidadosamente elaborado com ferramentas financeiras práticas, oferecemos uma visão mais clara das operações de cada empresa.",
      ],
      tagline: "Menos complexidade. Mais perspectiva.",
      button: "Começar agora",
    },
  },

  "pt-PT": {
    solutions: {
      label: "SOLUÇÕES",
      title: "Clareza em cada número.",
      highlight: "Confiança em cada decisão.",
      description:
        "Centralize as suas operações financeiras num espaço de trabalho sofisticado. Das transações diárias à gestão de várias empresas, o WJRFIN oferece-lhe a visão necessária para avançar com confiança.",
      cards: [
        {
          title: "Visão Financeira",
          description: "Uma perspetiva mais clara das finanças da sua empresa.",
        },
        {
          title: "Gestão Multiempresa",
          description: "Espaços independentes. Uma experiência integrada.",
        },
        {
          title: "Controlo de Transações",
          description: "Mantenha receitas e despesas organizadas.",
        },
        {
          title: "Organização Empresarial",
          description: "Faça a gestão de contactos e obrigações financeiras.",
        },
      ],
    },
    pricing: {
      label: "PREÇOS",
      title: "Uma forma mais inteligente",
      highlight: "de gerir a sua empresa.",
      description:
        "Descubra um espaço financeiro concebido para oferecer clareza, simplicidade e controlo.",
      workspace: "WJRFIN Workspace",
      availability: "Preços a anunciar brevemente",
      workspaceDescription:
        "Tudo o que precisa para uma visão mais clara das finanças da sua empresa.",
      features: [
        "Visão financeira",
        "Gestão de transações",
        "Espaços para várias empresas",
      ],
    },
    about: {
      label: "SOBRE O WJRFIN",
      title: "Criado para oferecer clareza.",
      highlight: "Concebido para grandes ambições.",
      paragraphs: [
        "O WJRFIN nasceu de uma visão simples: tornar a gestão financeira empresarial mais intuitiva, organizada e acessível.",
        "Ao combinar um design cuidado com ferramentas financeiras práticas, proporcionamos uma visão mais clara das operações de cada empresa.",
      ],
      tagline: "Menos complexidade. Mais perspetiva.",
      button: "Começar agora",
    },
  },

};
