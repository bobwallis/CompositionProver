// Adapt legacy declarations to Emscripten's libc++.
#include <string>
#include <type_traits>
#include <ringing/common.h>

#undef RINGING_DELEGATE_STD_SWAP
#define RINGING_DELEGATE_STD_SWAP(T) \
	RINGING_START_NAMESPACE_STD \
	template <> inline RINGING_API \
	void swap<RINGING_PREFIX T>(RINGING_PREFIX T& a, RINGING_PREFIX T& b) \
		noexcept(std::is_nothrow_move_constructible<RINGING_PREFIX T>::value && \
			std::is_nothrow_move_assignable<RINGING_PREFIX T>::value) \
	{ a.swap(b); } \
	RINGING_END_NAMESPACE_STD
