import React, { useState } from 'react';
import { Search, Music, Sparkles, TrendingUp, Loader2, ExternalLink } from 'lucide-react';

export default function LyricsAnalyzer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('track');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingSongId, setLoadingSongId] = useState(null);

  const handleAnalyzeSemantics = async () => {
    if (!searchResults[0]?.lyrics) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics: searchResults[0].lyrics }),
      });

      if (!response.ok) {
        throw new Error("Error en el análisis");
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      alert("Error al analizar emociones: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      const params = new URLSearchParams({ title: searchQuery });

      const response = await fetch(`/api/lyrics?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error obteniendo resultados");
      }

      const results = await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        throw new Error("No se encontraron coincidencias");
      }

      setSearchResults(results);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSong = async (songId) => {
    setLoadingSongId(songId);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch(`/api/${songId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error obteniendo la letra");
      }

      const songData = await response.json();

      setSearchResults([songData]); // ahora mostramos SOLO la seleccionada
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingSongId(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const resetApp = () => {
    setSearchResults([]);
    setSearchQuery('');
    setAnalysisResult(null);
    setError(null);
    setLoadingSongId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform" onClick={resetApp}>
            <Sparkles className="w-10 h-10 text-green-400 mr-3" />
            <h1 className="text-[40px] font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Lyrics Insight
            </h1>
            <Sparkles className="w-10 h-10 text-emerald-400 ml-3" />
          </div>
          <p className="text-lg text-green-600 font-medium">
            Descubre el alma de tus canciones favoritas
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Analiza letras, emociones y patrones lingüísticos
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  searchType === 'track'
                    ? 'Buscar canción... ej: Bohemian Rhapsody'
                    : searchType === 'album'
                      ? 'Buscar álbum... ej: Abbey Road'
                      : 'Buscar artista... ej: The Beatles'
                }
                className="w-full px-6 py-4 pr-14 rounded-2xl border-2 border-green-200 focus:border-green-400 focus:outline-none text-lg bg-white/50 backdrop-blur-sm transition-all"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Search Results or Detailed View */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            {searchResults.length === 1 && searchResults[0].lyrics ? (
              // VISTA DETALLADA (2 Columnas)
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 transition-all">
                {/* Header de la Canción */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 pb-4">
                  {searchResults[0].image && (
                    <img
                      src={searchResults[0].image}
                      alt={searchResults[0].title}
                      className="w-full md:w-64 md:h-64 rounded-2xl object-cover shadow-lg"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h2 className="text-4xl font-bold text-green-900 mb-2">{searchResults[0].title}</h2>
                        <p className="text-2xl text-green-700 mb-0">{searchResults[0].artist}</p>
                      </div>
                      <button
                        onClick={resetApp}
                        className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-100 text-green-700 rounded-xl hover:bg-green-50 transition-all font-medium text-sm"
                      >
                        <Search className="w-4 h-4" />
                        Nueva búsqueda
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid 2 Columnas: Letra y Análisis */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Columna Izquierda: Letra */}
                  <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                    <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                      <Music className="w-5 h-5" />
                      Letra Completa
                    </h3>
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed font-medium">
                      {searchResults[0].lyrics}
                    </div>
                  </div>

                  {/* Columna Derecha: Análisis */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-green-100 h-fit">
                    <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Análisis
                    </h3>

                    <div className="space-y-6">
                      {!analysisResult ? (
                        <div className="text-center py-8">
                          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
                            <p className="text-emerald-800 italic text-lg mb-2">
                              "Descubre los sentimientos ocultos en esta canción con IA."
                            </p>
                            <p className="text-sm text-emerald-600">
                              Analizaremos la letra para detectar alegría, melancolía, energía y más.
                            </p>
                          </div>

                          <button
                            onClick={handleAnalyzeSemantics}
                            disabled={isAnalyzing}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Analizando...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-6 h-6" />
                                Analizar con IA
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                          {/* 1. Resumen (Arriba del todo) */}
                          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 mb-6">
                            <p className="text-green-800 text-lg font-medium leading-relaxed">
                              "{analysisResult.sentiment}"
                            </p>
                          </div>

                          {/* 2. Barras de Emociones */}
                          <h4 className="font-bold text-green-900 mb-3 text-sm uppercase tracking-wider opacity-70">Emociones</h4>
                          <div className="space-y-5 mb-8">
                            {Object.entries(analysisResult.emotions).map(([emotion, value]) => (
                              <div key={emotion} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold text-gray-700 capitalize">
                                  <span>{emotion}</span>
                                  <span className="text-green-600">{value}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${value > 70 ? 'bg-green-500' : value > 40 ? 'bg-emerald-400' : 'bg-green-300'
                                      }`}
                                    style={{ width: `${value}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 3. Análisis de Temas */}
                          {analysisResult.temas && (
                            <>
                              <h4 className="font-bold text-green-900 mb-3 text-sm uppercase tracking-wider opacity-70 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Temas Principales
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-8">
                                {analysisResult.temas.map((tema, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium border border-teal-100 shadow-sm"
                                  >
                                    #{tema}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}

                          {/* 4. Patrones Lingüísticos */}
                          {analysisResult.estilo && (
                            <div>
                              <h4 className="font-bold text-green-900 mb-3 text-sm uppercase tracking-wider opacity-70 flex items-center gap-2">
                                <Music className="w-4 h-4" />
                                Estilo y Patrones
                              </h4>
                              <div className="">
                                <p className="text-green-800 text-sm leading-relaxed font-medium">
                                  {analysisResult.estilo}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // LISTA DE RESULTADOS
              <>
                <h2 className="text-2xl font-bold text-green-800 mb-4">Resultados encontrados:</h2>
                <div className="grid gap-4">
                  {searchResults.map((song) => (
                    <div key={song.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all relative overflow-hidden group">
                      {/* Loading Overlay */}
                      {loadingSongId === song.id && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-300">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                            <span className="text-sm font-bold text-green-800 animate-pulse">Cargando letra...</span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4">
                        {song.image && (
                          <img
                            src={song.image}
                            alt={song.title}
                            className="w-32 h-32 rounded-xl object-cover shadow-md flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold text-green-900 mb-2">{song.title}</h3>
                          <p className="text-gray-600 text-lg mb-4">{song.artist}</p>
                          <div className="flex flex-wrap gap-3 mb-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSong(song.id);
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium transform hover:scale-105"
                            >
                              <Sparkles className="w-4 h-4" />
                              Analizar letra
                            </button>
                            <a
                              href={song.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Ver en Genius
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="bg-gradient-to-br from-green-400 to-green-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-2">
              Análisis de Temas
            </h3>
            <p className="text-gray-600 text-sm">
              Identifica los temas principales y mensajes ocultos en las letras
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-2">
              Mapa de Emociones
            </h3>
            <p className="text-gray-600 text-sm">
              Visualiza las emociones predominantes en cada canción
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="bg-gradient-to-br from-teal-400 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-2">
              Patrones Lingüísticos
            </h3>
            <p className="text-gray-600 text-sm">
              Descubre el estilo único y la evolución del artista
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Silvia Piñeiro, 2025.</p>
        </div>
      </div>
    </div>
  );
}