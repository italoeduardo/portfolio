namespace Portfolio.Models;

/// <summary>Um projeto do portfólio.</summary>
public record Projeto(
    string Nome,
    string Subtitulo,
    string Descricao,
    string Icone,
    string Categoria,
    string[] Tecnologias,
    string[] Destaques,
    string CorAccent,
    string? Url = null,
    string? Repo = null,
    bool EmProducao = true
);

/// <summary>Uma competência técnica agrupada.</summary>
public record Skill(string Nome, string Icone, string[] Itens);

/// <summary>Um número de destaque (estatística do perfil).</summary>
public record Estatistica(string Valor, string Rotulo);
