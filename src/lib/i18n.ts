import type { Language } from "@/contexts/LanguageContext";

const messages: Record<string, [string, string, string, string]> = {
  "Delete": ["Delete", "Excluir", "Eliminar", "Eliminar"],
  "Are you sure you want to delete this transaction?": ["Are you sure you want to delete this transaction?", "Deseja realmente excluir esta transação?", "Tem a certeza de que pretende eliminar esta transação?", "¿Seguro que quieres eliminar esta transacción?"],
  "Loading transactions...": ["Loading transactions...", "Carregando transações...", "A carregar transações...", "Cargando transacciones..."],
  "Financial Management": [
    "Financial Management",
    "Gestão financeira",
    "Gestão financeira",
    "Gestión financiera"
  ],
  "Transactions": [
    "Transactions",
    "Transações",
    "Transações",
    "Transacciones"
  ],
  "Record and organize your business income and expenses.": [
    "Record and organize your business income and expenses.",
    "Registre e organize as receitas e despesas da empresa.",
    "Registe e organize as receitas e despesas da empresa.",
    "Registra y organiza los ingresos y gastos de tu empresa."
  ],
  "Add Income": [
    "Add Income",
    "Adicionar receita",
    "Adicionar receita",
    "Añadir ingreso"
  ],
  "Add Expense": [
    "Add Expense",
    "Adicionar despesa",
    "Adicionar despesa",
    "Añadir gasto"
  ],
  "Total Income": [
    "Total Income",
    "Receitas totais",
    "Receitas totais",
    "Ingresos totales"
  ],
  "Total Expenses": [
    "Total Expenses",
    "Despesas totais",
    "Despesas totais",
    "Gastos totales"
  ],
  "Net Balance": [
    "Net Balance",
    "Saldo líquido",
    "Saldo líquido",
    "Saldo neto"
  ],
  "Transaction History": [
    "Transaction History",
    "Histórico de transações",
    "Histórico de transações",
    "Historial de transacciones"
  ],
  "records": [
    "records",
    "registros",
    "registos",
    "registros"
  ],
  "Search transactions...": [
    "Search transactions...",
    "Buscar transações...",
    "Pesquisar transações...",
    "Buscar transacciones..."
  ],
  "All Types": [
    "All Types",
    "Todos os tipos",
    "Todos os tipos",
    "Todos los tipos"
  ],
  "Income": [
    "Income",
    "Receita",
    "Receita",
    "Ingreso"
  ],
  "Expense": [
    "Expense",
    "Despesa",
    "Despesa",
    "Gasto"
  ],
  "Date": [
    "Date",
    "Data",
    "Data",
    "Fecha"
  ],
  "Description": [
    "Description",
    "Descrição",
    "Descrição",
    "Descripción"
  ],
  "Category": [
    "Category",
    "Categoria",
    "Categoria",
    "Categoría"
  ],
  "Type": [
    "Type",
    "Tipo",
    "Tipo",
    "Tipo"
  ],
  "Amount": [
    "Amount",
    "Valor",
    "Valor",
    "Importe"
  ],
  "Actions": [
    "Actions",
    "Ações",
    "Ações",
    "Acciones"
  ],
  "No transactions found.": [
    "No transactions found.",
    "Nenhuma transação encontrada.",
    "Nenhuma transação encontrada.",
    "No se encontraron transacciones."
  ],
  "Financial tracking only. WJRFIN does not process payments or transfer funds. Records are saved to your company workspace.": [
    "Financial tracking only. WJRFIN does not process payments or transfer funds. Records are saved to your company workspace.",
    "Apenas controle financeiro. O WJRFIN não processa pagamentos nem transfere fundos. Os registros são salvos no espaço da empresa.",
    "Apenas controlo financeiro. O WJRFIN não processa pagamentos nem transfere fundos. Os registos são guardados no espaço da empresa.",
    "Solo gestión financiera. WJRFIN no procesa pagos ni transfiere fondos. Los registros se guardan en el espacio de la empresa."
  ],
  "Edit Transaction": [
    "Edit Transaction",
    "Editar transação",
    "Editar transação",
    "Editar transacción"
  ],
  "Manual financial record": [
    "Manual financial record",
    "Registro financeiro manual",
    "Registo financeiro manual",
    "Registro financiero manual"
  ],
  "Transaction Type": [
    "Transaction Type",
    "Tipo de transação",
    "Tipo de transação",
    "Tipo de transacción"
  ],
  "e.g. Client payment, Office rent...": [
    "e.g. Client payment, Office rent...",
    "Ex.: pagamento de cliente, aluguel...",
    "Ex.: pagamento de cliente, renda...",
    "Ej.: pago de cliente, alquiler..."
  ],
  "Sales": [
    "Sales",
    "Vendas",
    "Vendas",
    "Ventas"
  ],
  "Services": [
    "Services",
    "Serviços",
    "Serviços",
    "Servicios"
  ],
  "Facilities": [
    "Facilities",
    "Instalações",
    "Instalações",
    "Instalaciones"
  ],
  "Marketing": [
    "Marketing",
    "Marketing",
    "Marketing",
    "Marketing"
  ],
  "Software": [
    "Software",
    "Software",
    "Software",
    "Software"
  ],
  "Supplies": [
    "Supplies",
    "Suprimentos",
    "Material",
    "Suministros"
  ],
  "Payroll": [
    "Payroll",
    "Folha de pagamento",
    "Processamento salarial",
    "Nómina"
  ],
  "Other": [
    "Other",
    "Outros",
    "Outros",
    "Otros"
  ],
  "Cancel": [
    "Cancel",
    "Cancelar",
    "Cancelar",
    "Cancelar"
  ],
  "Save Changes": [
    "Save Changes",
    "Salvar alterações",
    "Guardar alterações",
    "Guardar cambios"
  ],
  "Save Transaction": [
    "Save Transaction",
    "Salvar transação",
    "Guardar transação",
    "Guardar transacción"
  ],
  "Saving...": [
    "Saving...",
    "Salvando...",
    "A guardar...",
    "Guardando..."
  ],
  "Close form": [
    "Close form",
    "Fechar formulário",
    "Fechar formulário",
    "Cerrar formulario"
  ],
  "Business Directory": [
    "Business Directory",
    "Diretório empresarial",
    "Diretório empresarial",
    "Directorio empresarial"
  ],
  "Contacts": [
    "Contacts",
    "Contatos",
    "Contactos",
    "Contactos"
  ],
  "Manage your clients, suppliers and business relationships.": [
    "Manage your clients, suppliers and business relationships.",
    "Gerencie clientes, fornecedores e relações comerciais.",
    "Gira clientes, fornecedores e relações comerciais.",
    "Gestiona clientes, proveedores y relaciones comerciales."
  ],
  "Add Contact": [
    "Add Contact",
    "Adicionar contato",
    "Adicionar contacto",
    "Añadir contacto"
  ],
  "Total Contacts": [
    "Total Contacts",
    "Total de contatos",
    "Total de contactos",
    "Total de contactos"
  ],
  "Clients": [
    "Clients",
    "Clientes",
    "Clientes",
    "Clientes"
  ],
  "Suppliers": [
    "Suppliers",
    "Fornecedores",
    "Fornecedores",
    "Proveedores"
  ],
  "Contact Directory": [
    "Contact Directory",
    "Lista de contatos",
    "Lista de contactos",
    "Directorio de contactos"
  ],
  "contacts": [
    "contacts",
    "contatos",
    "contactos",
    "contactos"
  ],
  "Search contacts...": [
    "Search contacts...",
    "Buscar contatos...",
    "Pesquisar contactos...",
    "Buscar contactos..."
  ],
  "All Contacts": [
    "All Contacts",
    "Todos os contatos",
    "Todos os contactos",
    "Todos los contactos"
  ],
  "Client": [
    "Client",
    "Cliente",
    "Cliente",
    "Cliente"
  ],
  "Supplier": [
    "Supplier",
    "Fornecedor",
    "Fornecedor",
    "Proveedor"
  ],
  "Contact": [
    "Contact",
    "Contato",
    "Contacto",
    "Contacto"
  ],
  "Company": [
    "Company",
    "Empresa",
    "Empresa",
    "Empresa"
  ],
  "Email": [
    "Email",
    "E-mail",
    "E-mail",
    "Correo electrónico"
  ],
  "Phone": [
    "Phone",
    "Telefone",
    "Telefone",
    "Teléfono"
  ],
  "No contacts found.": [
    "No contacts found.",
    "Nenhum contato encontrado.",
    "Nenhum contacto encontrado.",
    "No se encontraron contactos."
  ],
  "Contacts are stored locally in this browser. Sample contacts are provided for demonstration.": [
    "Contacts are stored locally in this browser. Sample contacts are provided for demonstration.",
    "Os contatos são armazenados neste navegador.",
    "Os contactos são guardados neste navegador.",
    "Los contactos se guardan en este navegador."
  ],
  "Edit Contact": [
    "Edit Contact",
    "Editar contato",
    "Editar contacto",
    "Editar contacto"
  ],
  "Business contact information": [
    "Business contact information",
    "Informações de contato comercial",
    "Informações de contacto comercial",
    "Información de contacto comercial"
  ],
  "Full Name": [
    "Full Name",
    "Nome completo",
    "Nome completo",
    "Nombre completo"
  ],
  "Email Address": [
    "Email Address",
    "Endereço de e-mail",
    "Endereço de e-mail",
    "Correo electrónico"
  ],
  "Phone Number": [
    "Phone Number",
    "Número de telefone",
    "Número de telefone",
    "Número de teléfono"
  ],
  "Contact Type": [
    "Contact Type",
    "Tipo de contato",
    "Tipo de contacto",
    "Tipo de contacto"
  ],
  "Save Contact": [
    "Save Contact",
    "Salvar contato",
    "Guardar contacto",
    "Guardar contacto"
  ],
  "Business Workspace": [
    "Business Workspace",
    "Espaço da empresa",
    "Espaço da empresa",
    "Espacio de la empresa"
  ],
  "Business Finance": [
    "Business Finance",
    "Finanças empresariais",
    "Finanças empresariais",
    "Finanzas empresariales"
  ],
  "Business Overview": [
    "Business Overview",
    "Visão geral do negócio",
    "Visão geral do negócio",
    "Resumen del negocio"
  ],
  "Hello,": [
    "Hello,",
    "Olá,",
    "Olá,",
    "Hola,"
  ],
  "WJRFIN Workspace": [
    "WJRFIN Workspace",
    "Espaço WJRFIN",
    "Espaço WJRFIN",
    "Espacio WJRFIN"
  ],
  "This module is coming in the next development phase.": [
    "This module is coming in the next development phase.",
    "Este módulo ainda não está disponível.",
    "Este módulo ainda não está disponível.",
    "Este módulo aún no está disponible."
  ],
  "Unlock advanced financial reports and team management.": [
    "Unlock advanced financial reports and team management.",
    "Relatórios avançados e gestão de equipes em breve.",
    "Relatórios avançados e gestão de equipas em breve.",
    "Próximamente: informes avanzados y gestión de equipos."
  ],
  "Coming Soon": [
    "Coming Soon",
    "Em breve",
    "Em breve",
    "Próximamente"
  ],
  "vs. previous period": [
    "vs. previous period",
    "em relação ao período anterior",
    "face ao período anterior",
    "respecto al período anterior"
  ],
  "Recent Transactions": [
    "Recent Transactions",
    "Transações recentes",
    "Transações recentes",
    "Transacciones recientes"
  ],
  "Cash Flow Overview": [
    "Cash Flow Overview",
    "Visão geral do fluxo de caixa",
    "Visão geral do fluxo de caixa",
    "Resumen del flujo de caja"
  ],
  "Revenue": [
    "Revenue",
    "Receita",
    "Receita",
    "Ingresos"
  ],
  "Expenses": [
    "Expenses",
    "Despesas",
    "Despesas",
    "Gastos"
  ],
  "View All": [
    "View All",
    "Ver todas",
    "Ver todas",
    "Ver todas"
  ],
  "No recent transactions": [
    "No recent transactions",
    "Nenhuma transação recente",
    "Nenhuma transação recente",
    "Sin transacciones recientes"
  ],
  "Business Financial Intelligence.": [
    "Business Financial Intelligence.",
    "Inteligência financeira empresarial.",
    "Inteligência financeira empresarial.",
    "Inteligencia financiera empresarial."
  ],
  "Aparência": [
    "Appearance",
    "Aparência",
    "Aparência",
    "Apariencia"
  ],
  "Personalize as cores da sua plataforma.": [
    "Customize your platform colors.",
    "Personalize as cores da sua plataforma.",
    "Personalize as cores da sua plataforma.",
    "Personaliza los colores de tu plataforma."
  ],
  "Sua preferência é salva automaticamente neste navegador.": [
    "Your preference is saved automatically in this browser.",
    "Sua preferência é salva automaticamente neste navegador.",
    "A sua preferência é guardada automaticamente neste navegador.",
    "Tu preferencia se guarda automáticamente en este navegador."
  ],
  "Elegante e sofisticado": [
    "Elegant and sophisticated",
    "Elegante e sofisticado",
    "Elegante e sofisticado",
    "Elegante y sofisticado"
  ],
  "Moderno e natural": [
    "Modern and natural",
    "Moderno e natural",
    "Moderno e natural",
    "Moderno y natural"
  ],
  "Escuro e refinado": [
    "Dark and refined",
    "Escuro e refinado",
    "Escuro e refinado",
    "Oscuro y refinado"
  ],
  "Profissional e equilibrado": [
    "Professional and balanced",
    "Profissional e equilibrado",
    "Profissional e equilibrado",
    "Profesional y equilibrado"
  ],
  "Suave e minimalista": [
    "Soft and minimalist",
    "Suave e minimalista",
    "Suave e minimalista",
    "Suave y minimalista"
  ]
};

export function translate(language: Language, key: string): string {
  const entry = messages[key];
  if (!entry) return key;
  return entry[({ en: 0, "pt-BR": 1, "pt-PT": 2, es: 3 } as const)[language]];
}
