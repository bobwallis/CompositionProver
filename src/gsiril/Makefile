EMXX ?= em++
CXXFLAGS ?= -O2

RINGING_DIR := ringing-lib
GSIRIL_DIR := $(RINGING_DIR)/apps/gsiril
UTILS_DIR := $(RINGING_DIR)/utils
BUILD_DIR := build
GENERATED_DIR := $(BUILD_DIR)/generated

CORE_SOURCES := bell change row mathutils place_notation method methodset \
	method_stream library libfacet libout litelib xmllib xmlout peal \
	lexical_cast stl dom_stub
MAIN_SOURCES := mslib cclib extent group proof falseness touch row_wildcard \
	music print print_ps dimension printm print_pdf pdf_fonts search_base \
	basic_search multtab table_search streamutils
UTILS_SOURCES := args tokeniser stringutils exec row_calc console_stream argv \
	bell_fmt
GSIRIL_SOURCES := main execution_context expr_base proof_context symbol_table \
	expression statement parser prog_args import functions

CORE_OBJECTS := $(addprefix $(BUILD_DIR)/ringing/, \
	$(addsuffix .o,$(CORE_SOURCES)))
MAIN_OBJECTS := $(addprefix $(BUILD_DIR)/ringing/, \
	$(addsuffix .o,$(MAIN_SOURCES)))
UTILS_OBJECTS := $(addprefix $(BUILD_DIR)/utils/, \
	$(addsuffix .o,$(UTILS_SOURCES)))
GSIRIL_OBJECTS := $(addprefix $(BUILD_DIR)/gsiril/, \
	$(addsuffix .o,$(GSIRIL_SOURCES)))
OBJECTS := $(CORE_OBJECTS) $(MAIN_OBJECTS) $(UTILS_OBJECTS) $(GSIRIL_OBJECTS)

CPPFLAGS += -I$(RINGING_DIR) -I$(RINGING_DIR)/ringing -I$(UTILS_DIR) \
	-I$(GSIRIL_DIR) -I$(GENERATED_DIR)
COMPILE_FLAGS := -std=gnu++14 -fexceptions -include $(CURDIR)/emscripten-compat.h \
	-MMD -MP $(CXXFLAGS)
LINK_FLAGS := $(CXXFLAGS) -fexceptions \
	-sMODULARIZE=1 \
	-sEXPORT_NAME=createGsiril \
	-sINVOKE_RUN=0 \
	-sEXPORTED_RUNTIME_METHODS=FS,callMain \
	-sFORCE_FILESYSTEM=1 \
	-sALLOW_MEMORY_GROWTH=1 \
	-sEXIT_RUNTIME=1 \
	-sENVIRONMENT=web,worker,node

.PHONY: all clean

all: gsiril.js gsiril.wasm

gsiril.js gsiril.wasm &: $(OBJECTS) Makefile
	$(EMXX) $(LINK_FLAGS) $(OBJECTS) -o gsiril.js

$(OBJECTS): Makefile emscripten-compat.h

$(BUILD_DIR)/generated/init.dat: $(GSIRIL_DIR)/escape.awk $(GSIRIL_DIR)/init/gsiril.init
	mkdir -p $(dir $@)
	awk -f $(GSIRIL_DIR)/escape.awk $(GSIRIL_DIR)/init/gsiril.init > $@

$(BUILD_DIR)/gsiril/main.o: $(BUILD_DIR)/generated/init.dat

$(BUILD_DIR)/ringing/%.o: $(RINGING_DIR)/ringing/%.cpp
	mkdir -p $(dir $@)
	$(EMXX) $(CPPFLAGS) $(COMPILE_FLAGS) -c $< -o $@

$(BUILD_DIR)/utils/%.o: $(UTILS_DIR)/%.cpp
	mkdir -p $(dir $@)
	$(EMXX) $(CPPFLAGS) $(COMPILE_FLAGS) -c $< -o $@

$(BUILD_DIR)/gsiril/%.o: $(GSIRIL_DIR)/%.cpp
	mkdir -p $(dir $@)
	$(EMXX) $(CPPFLAGS) $(COMPILE_FLAGS) -c $< -o $@

-include $(OBJECTS:.o=.d)

clean:
	rm -rf $(BUILD_DIR) gsiril.js gsiril.wasm
