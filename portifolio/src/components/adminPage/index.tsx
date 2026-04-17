"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Container,
  Header,
  Title,
  LogoutButton,
  TabsContainer,
  Tab,
  Form,
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  CheckboxGrid,
  CheckboxLabel,
  SubmitButton,
  ProjectList,
  ProjectItem,
  ProjectInfo,
  Actions,
  ActionButton,
  ModalOverlay,
  ModalBox,
  ModalButtons,
} from "./styles";

export const AdminPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("addProject");

  // Dados do Banco
  const [techList, setTechList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);

  // Estados Formulário Projeto
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectImage, setProjectImage] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [projectDescPt, setProjectDescPt] = useState("");
  const [projectDescEn, setProjectDescEn] = useState("");
  const [isMainProject, setIsMainProject] = useState(false);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  // Estados Formulário Tecnologia
  const [techName, setTechName] = useState("");
  const [techImage, setTechImage] = useState("");
  const [techCategory, setTechCategory] = useState("Front-end");

  // Popups
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // 1. Carregar Dados Iniciais
  useEffect(() => {
    fetchTechnologies();
    fetchProjects();
  }, []);

  const fetchTechnologies = async () => {
    const { data, error } = await supabase.from("technologies").select("id, name, category");
    if (!error && data) setTechList(data);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("id, title, main, description");
    if (!error && data) setProjectsList(data);
  };

  // 2. Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // 3. Lidar com Checkboxes de Tecnologia
  const handleTechToggle = (techId: string) => {
    setSelectedTechs((prev) =>
      prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId]
    );
  };

  // 4. Salvar Projeto (Criação e Edição)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      title: projectTitle,
      cover_url: projectImage,
      project_url: projectLink,
      main: isMainProject,
      description: { pt: projectDescPt, en: projectDescEn }, // Formato JSONB
    };

    let currentProjectId = editingProjectId;

    if (editingProjectId) {
      // UPDATE
      const { error } = await supabase.from("projects").update(projectData).eq("id", editingProjectId);
      if (error) { console.error(error); return; }

      // Limpar tecnologias antigas
      await supabase.from("project_technologies").delete().eq("project_id", editingProjectId);
    } else {
      // INSERT
      const { data, error } = await supabase.from("projects").insert([projectData]).select("id").single();
      if (error) { console.error(error); return; }
      currentProjectId = data.id;
    }

    // Inserir Novas Tecnologias Relacionadas (Tabela N:N)
    if (currentProjectId && selectedTechs.length > 0) {
      const techInserts = selectedTechs.map((techId) => ({
        project_id: currentProjectId,
        technology_id: techId,
      }));
      await supabase.from("project_technologies").insert(techInserts);
    }

    resetProjectForm();
    fetchProjects();
    setShowSuccessPopup(true);
  };

  // 5. Salvar Tecnologia
  const handleAddTechnology = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("technologies").insert([
      { name: techName, logo_url: techImage, category: techCategory }
    ]);

    if (!error) {
      setTechName(""); setTechImage(""); setTechCategory("Front-end");
      fetchTechnologies();
      setShowSuccessPopup(true);
    } else {
      console.error(error);
    }
  };

  // 6. Preparar Edição de Projeto
  const handleEditClick = async (project: any) => {
    setEditingProjectId(project.id);
    setProjectTitle(project.title);
    setProjectImage(project.cover_url || "");
    setProjectLink(project.project_url || "");
    setIsMainProject(project.main || false);
    
    // Desestruturar JSONB
    if (project.description) {
      setProjectDescPt(project.description.pt || "");
      setProjectDescEn(project.description.en || "");
    }

    // Buscar tecnologias vinculadas
    const { data } = await supabase.from("project_technologies").select("technology_id").eq("project_id", project.id);
    if (data) setSelectedTechs(data.map((pt) => pt.technology_id));

    setActiveTab("addProject");
  };

  // 7. Excluir Projeto
  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      // A tabela project_technologies deve ter ON DELETE CASCADE configurado no banco
      const { error } = await supabase.from("projects").delete().eq("id", projectToDelete);
      if (!error) {
        fetchProjects();
      } else {
        console.error(error);
      }
    }
    setShowDeletePopup(false);
    setProjectToDelete(null);
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectTitle(""); setProjectImage(""); setProjectLink("");
    setProjectDescPt(""); setProjectDescEn(""); setIsMainProject(false);
    setSelectedTechs([]);
  };

  return (
    <Container>
      <Header>
        <Title>Painel Administrativo</Title>
        <LogoutButton onClick={handleLogout}>Sair do Sistema</LogoutButton>
      </Header>

      <TabsContainer>
        <Tab $active={activeTab === "addProject"} onClick={() => setActiveTab("addProject")}>
          {editingProjectId ? "✏️ Editar Projeto" : "➕ Novo Projeto"}
        </Tab>
        <Tab $active={activeTab === "addTech"} onClick={() => setActiveTab("addTech")}>
          ⚙️ Nova Tecnologia
        </Tab>
        <Tab $active={activeTab === "manage"} onClick={() => setActiveTab("manage")}>
          📋 Gerenciar Projetos
        </Tab>
      </TabsContainer>

      {/* ABA: ADICIONAR / EDITAR PROJETO */}
      {activeTab === "addProject" && (
        <Form onSubmit={handleSaveProject}>
          <FormGroup>
            <Label>Nome do Projeto</Label>
            <Input type="text" required value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <Label>URL da Imagem de Capa</Label>
            <Input type="text" value={projectImage} onChange={(e) => setProjectImage(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <Label>Link do Projeto (URL)</Label>
            <Input type="text" value={projectLink} onChange={(e) => setProjectLink(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <Label>Descrição (Português) - jsonb</Label>
            <TextArea required value={projectDescPt} onChange={(e) => setProjectDescPt(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <Label>Descrição (Inglês) - jsonb</Label>
            <TextArea required value={projectDescEn} onChange={(e) => setProjectDescEn(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <Label>Tecnologias Vinculadas</Label>
            <CheckboxGrid>
              {techList.map((tech) => (
                <CheckboxLabel key={tech.id}>
                  <input
                    type="checkbox"
                    checked={selectedTechs.includes(tech.id)}
                    onChange={() => handleTechToggle(tech.id)}
                  />
                  {tech.name}
                </CheckboxLabel>
              ))}
            </CheckboxGrid>
          </FormGroup>

          <FormGroup>
            <CheckboxLabel>
              <input type="checkbox" checked={isMainProject} onChange={(e) => setIsMainProject(e.target.checked)} />
              Destaque na Página Inicial (Main = True)
            </CheckboxLabel>
          </FormGroup>

          <SubmitButton type="submit">
            {editingProjectId ? "Salvar Alterações" : "Cadastrar Projeto"}
          </SubmitButton>
          
          {editingProjectId && (
             <ActionButton type="button" $danger onClick={resetProjectForm} style={{marginTop: '10px'}}>
               Cancelar Edição
             </ActionButton>
          )}
        </Form>
      )}

      {/* ABA: ADICIONAR TECNOLOGIA */}
      {activeTab === "addTech" && (
        <Form onSubmit={handleAddTechnology}>
          <FormGroup>
            <Label>Nome da Tecnologia</Label>
            <Input type="text" required value={techName} onChange={(e) => setTechName(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <Label>URL do Ícone/Logo</Label>
            <Input type="text" value={techImage} onChange={(e) => setTechImage(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <Label>Categoria</Label>
            <Select value={techCategory} onChange={(e) => setTechCategory(e.target.value)}>
              <option value="Front-end">Front-end</option>
              <option value="Back-end">Back-end</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
            </Select>
          </FormGroup>

          <SubmitButton type="submit">Cadastrar Tecnologia</SubmitButton>
        </Form>
      )}

      {/* ABA: GERENCIAR PROJETOS */}
      {activeTab === "manage" && (
        <ProjectList>
          {projectsList.map((project) => (
            <ProjectItem key={project.id}>
              <ProjectInfo>
                <strong>{project.title}</strong>
                <span>{project.main ? "🌟 Projeto Principal (Main: true)" : "Projeto Comum (Main: false)"}</span>
              </ProjectInfo>
              <Actions>
                <ActionButton onClick={() => handleEditClick(project)}>✏️ Editar</ActionButton>
                <ActionButton $danger onClick={() => { setProjectToDelete(project.id); setShowDeletePopup(true); }}>
                  🗑️ Excluir
                </ActionButton>
              </Actions>
            </ProjectItem>
          ))}
          {projectsList.length === 0 && <p>Nenhum projeto cadastrado no banco de dados.</p>}
        </ProjectList>
      )}

      {/* MODAL DE SUCESSO */}
      {showSuccessPopup && (
        <ModalOverlay>
          <ModalBox>
            <h2>✅ Sucesso!</h2>
            <p>A operação foi realizada e salva no banco de dados.</p>
            <ModalButtons>
              <ActionButton onClick={() => setShowSuccessPopup(false)}>Fechar</ActionButton>
            </ModalButtons>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* MODAL DE EXCLUSÃO */}
      {showDeletePopup && (
        <ModalOverlay>
          <ModalBox>
            <h2>⚠️ Confirmar Exclusão</h2>
            <p>Tem certeza que deseja apagar este projeto? Esta ação não pode ser desfeita.</p>
            <ModalButtons>
              <ActionButton $danger onClick={confirmDeleteProject}>Sim, Apagar</ActionButton>
              <ActionButton onClick={() => setShowDeletePopup(false)}>Cancelar</ActionButton>
            </ModalButtons>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};