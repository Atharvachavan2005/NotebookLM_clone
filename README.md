%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#0052CC', 'edgeLabelBackground':'#ffffff', 'tertiaryColor': '#F4F5F7'}}}%%
graph TD
    %% --- STYLING ---
    classDef ingress fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1;
    classDef processing fill:#FFF3E0,stroke:#E65100,stroke-width:2px,color:#E65100;
    classDef storage fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20;
    classDef brain fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C;
    classDef app fill:#F4F5F7,stroke:#091E42,stroke-width:3px,color:#091E42;

    subgraph KnowledgeCast_Platform [KnowledgeCast AI Platform]
        direction TB
        
        %% --- LAYER 1: USER INTERFACE ---
        subgraph User_Interface [Frontend Application & Interaction Layer]
            direction LR
            UI_Upload(📄 Data Upload & Management)
            UI_Chat(💬 Interactive RAG Chat)
            UI_Podcast(🎧 AI Podcast Studio)
        end
        class UI_Upload,UI_Chat,UI_Podcast app;

        %% --- LAYER 2: THE BRAIN (LLM & MEMORY) ---
        subgraph Intelligence_Layer [Cognitive & Memory Engine]
            direction TB
            LLM(🧠 Google Gemini 2.5 Flash<br/>*Reasoning & Script Generation*)
            Memory_Agent(🧞 Zep Knowledge Graph<br/>*Temporal Context & Entities*)
        end
        class LLM,Memory_Agent brain;

        %% --- LAYER 3: KNOWLEDGE STORAGE ---
        subgraph Knowledge_Base [Vector Knowledge Store]
            direction TB
            Milvus[(🗄️ Milvus Lite Vector DB)]
            subgraph Data_Structure
                V_Embeds[Vector Embeddings]
                Raw_Txt[Raw Chunks]
                Meta_Data[Source Metadata]
            end
        end
        class Milvus,V_Embeds,Raw_Txt,Meta_Data storage;

        %% --- LAYER 4: INGESTION PIPELINE ---
        subgraph Data_Ingestion [Multimodal Ingestion Pipeline]
            direction TB
            subgraph Sources
                PDF[📄 PDFs & Docs]
                URL[🌐 Web URLs]
                Video[📹 YouTube/Media]
            end
            subgraph Processors
                Parser(🔍 PyMuPDF Doc Parser)
                Scraper(🕷️ Firecrawl Web Scraper)
                Transcriber(🗣️ AssemblyAI Transcriber)
            end
            Embedder(🧮 Embedding Model<br/>*Text-to-Vector*)
        end
        class PDF,URL,Video ingress;
        class Parser,Scraper,Transcriber,Embedder processing;

        %% --- LAYER 5: AUDIO SYNTHESIS ---
        subgraph Audio_Synthesis [Neural Podcast Factory]
            direction LR
            Script_Gen(📝 Agentic Scriptwriter)
            TTS_Engine(🔊 EdgeTTS / Kokoro<br/>*Neural Voice Synthesis*)
            Audio_Mixer(🎵 Multi-Speaker Mixer)
        end
        class Script_Gen,TTS_Engine,Audio_Mixer processing;
    end

    %% --- CONNECTIONS (THE FLOW) ---
    %% Ingestion Flow
    PDF --> Parser
    URL --> Scraper
    Video --> Transcriber
    Parser & Scraper & Transcriber --> Embedder
    Embedder -- "Store Vectors & Metadata" --> Milvus
    Raw_Txt -.-> Milvus
    Meta_Data -.-> Milvus

    %% Chat RAG Flow
    UI_Chat -- "1. User Query" --> LLM
    LLM -- "2. Semantic Search" --> Milvus
    Milvus -- "3. Retrieve Relevant Context" --> LLM
    LLM -- "4. Generate Answer with Context" --> UI_Chat
    UI_Chat -. "5. Save Interaction" .-> Memory_Agent

    %% Podcast Flow
    UI_Podcast -- "1. Request Podcast" --> Script_Gen
    Script_Gen -- "2. Generate Dialogue" --> LLM
    LLM -- "3. Return Script JSON" --> Script_Gen
    Script_Gen -- "4. Send Segments" --> TTS_Engine
    TTS_Engine -- "5. Synthesize Voices" --> Audio_Mixer
    Audio_Mixer -- "6. Final Audio File" --> UI_Podcast