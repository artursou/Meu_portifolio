"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { parseLocalized } from "@/lib/localize";
import type { Project, Technology } from "@/types";
import { VisitsPanel } from "@/components/visitsPanel";
import { AccountPanel } from "@/components/accountPanel";
import { ChatUsagePanel } from "@/components/chatUsagePanel";
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
  const [techList, setTechList] = useState<Pick<Technology, "id" | "name" | "category">[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Carregar Dados Iniciais
  const fetchTechnologies = async () => {
    const { data, error } = await supabase.from("technologies").select("id, name, category");
    if (error) setErrorMessage(`Erro ao carregar tecnologias: ${error.message}`);
    else if (data) setTechList(data);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("id, title, main, description, cover_url, project_url");
    if (error) setErrorMessage(`Erro ao carregar projetos: ${error.message}`);
    else if (data) setProjectsList(data as Project[]);
  };

  useEffect(() => {
    // Busca inicial (o setState acontece depois da resposta do banco)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTechnologies();
    fetchProjects();
  }, []);

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
    if (saving) return;
    setSaving(true);

    const projectData = {
      title: projectTitle,
      cover_url: projectImage || null,
      project_url: projectLink || null,
      main: isMainProject,
      description: { pt: projectDescPt, en: projectDescEn }, // Formato JSONB
    };

    try {
      let projectId: string;
      let currentTechIds: string[] = [];

      if (editingProjectId) {
        // UPDATE
        const { error } = await supabase.from("projects").update(projectData).eq("id", editingProjectId);
        if (error) throw new Error(`Erro ao atualizar o projeto: ${error.message}`);
        projectId = editingProjectId;

        // Busca as tecnologias que já estão vinculadas
        const { data, error: linksError } = await supabase
          .from("project_technologies")
          .select("technology_id")
          .eq("project_id", projectId);
        if (linksError) throw new Error(`Erro ao ler tecnologias do projeto: ${linksError.message}`);
        currentTechIds = (data || []).map((pt) => pt.technology_id);
      } else {
        // INSERT
        const { data, error } = await supabase.from("projects").insert([projectData]).select("id").single();
        if (error) throw new Error(`Erro ao cadastrar o projeto: ${error.message}`);
        projectId = data.id;
      }

      // Tabela N:N — só mexe no que mudou, assim uma falha não apaga os vínculos existentes
      const toRemove = currentTechIds.filter((id) => !selectedTechs.includes(id));
      const toAdd = selectedTechs.filter((id) => !currentTechIds.includes(id));

      if (toAdd.length > 0) {
        const { error } = await supabase
          .from("project_technologies")
          .insert(toAdd.map((techId) => ({ project_id: projectId, technology_id: techId })));
        if (error) throw new Error(`Projeto salvo, mas houve erro ao vincular tecnologias: ${error.message}`);
      }

      if (toRemove.length > 0) {
        const { error } = await supabase
          .from("project_technologies")
          .delete()
          .eq("project_id", projectId)
          .in("technology_id", toRemove);
        if (error) throw new Error(`Projeto salvo, mas houve erro ao desvincular tecnologias: ${error.message}`);
      }

      resetProjectForm();
      setShowSuccessPopup(true);
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Erro inesperado ao salvar o projeto.");
    } finally {
      fetchProjects();
      setSaving(false);
    }
  };

  // 5. Salvar Tecnologia
  const handleAddTechnology = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const { error } = await supabase.from("technologies").insert([
      { name: techName, logo_url: techImage || null, category: techCategory }
    ]);
    setSaving(false);

    if (!error) {
      setTechName(""); setTechImage(""); setTechCategory("Front-end");
      fetchTechnologies();
      setShowSuccessPopup(true);
    } else {
      console.error(error);
      setErrorMessage(`Erro ao cadastrar a tecnologia: ${error.message}`);
    }
  };

  // 6. Preparar Edição de Projeto
  const handleEditClick = async (project: Project) => {
    // Buscar tecnologias vinculadas antes de abrir o formulário
    const { data, error } = await supabase.from("project_technologies").select("technology_id").eq("project_id", project.id);
    if (error) {
      setErrorMessage(`Erro ao carregar tecnologias do projeto: ${error.message}`);
      return;
    }

    setEditingProjectId(project.id);
    setProjectTitle(project.title);
    setProjectImage(project.cover_url || "");
    setProjectLink(project.project_url || "");
    setIsMainProject(project.main || false);

    // Desestruturar JSONB
    const description = parseLocalized(project.description);
    setProjectDescPt(description.pt || "");
    setProjectDescEn(description.en || "");

    setSelectedTechs((data || []).map((pt) => pt.technology_id));
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
        setErrorMessage(`Erro ao excluir o projeto: ${error.message}`);
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
        <Tab $active={activeTab === "visits"} onClick={() => setActiveTab("visits")}>
          📊 Visitas
        </Tab>
        <Tab $active={activeTab === "chatUsage"} onClick={() => setActiveTab("chatUsage")}>
          🤖 Uso do Chat
        </Tab>
        <Tab $active={activeTab === "account"} onClick={() => setActiveTab("account")}>
          🔒 Minha conta
        </Tab>
      </TabsContainer>

      {/* ABA: USO DO CHAT */}
      {activeTab === "chatUsage" && <ChatUsagePanel onError={setErrorMessage} />}

      {/* ABA: MINHA CONTA */}
      {activeTab === "account" && (
        <AccountPanel onError={setErrorMessage} onSuccess={() => setShowSuccessPopup(true)} />
      )}

      {/* ABA: VISITAS */}
      {activeTab === "visits" && <VisitsPanel onError={setErrorMessage} />}

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

          <SubmitButton type="submit" disabled={saving}>
            {saving ? "Salvando..." : editingProjectId ? "Salvar Alterações" : "Cadastrar Projeto"}
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

          <SubmitButton type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Cadastrar Tecnologia"}
          </SubmitButton>
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

      {/* MODAL DE ERRO */}
      {errorMessage && (
        <ModalOverlay>
          <ModalBox>
            <h2>❌ Algo deu errado</h2>
            <p>{errorMessage}</p>
            <ModalButtons>
              <ActionButton onClick={() => setErrorMessage(null)}>Fechar</ActionButton>
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