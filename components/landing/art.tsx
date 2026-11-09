/**
 * Replaceable vector illustrations for the landing page.
 * To use real photos instead, swap the <svg> blocks for <Image> and keep the
 * surrounding aspect-ratio containers unchanged. No fade/gradient overlays.
 */

export function BusScene({ label }: { label: string }) {
  return (
    <svg
      className="lp-bus-art"
      viewBox="0 0 960 440"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Sky + soft sun */}
      <rect width="960" height="440" fill="#E8EFFA" />
      <circle cx="820" cy="96" r="72" fill="#F5C518" opacity=".35" />
      <circle cx="820" cy="96" r="44" fill="#F5C518" opacity=".6" />

      {/* Clouds */}
      <g fill="#F7FAFF">
        <rect x="568" y="58" width="118" height="24" rx="12" />
        <rect x="596" y="44" width="62" height="24" rx="12" />
        <rect x="92" y="74" width="96" height="20" rx="10" />
      </g>

      {/* School building */}
      <g>
        <rect x="64" y="176" width="248" height="144" rx="10" fill="#D5E1F4" />
        <rect x="92" y="150" width="192" height="34" rx="8" fill="#C4D4EE" />
        <rect x="196" y="132" width="34" height="26" rx="4" fill="#C4D4EE" />
        <circle cx="213" cy="145" r="6" fill="#F5C518" />
        <g fill="#F7FAFF">
          <rect x="92" y="198" width="38" height="34" rx="5" />
          <rect x="148" y="198" width="38" height="34" rx="5" />
          <rect x="204" y="198" width="38" height="34" rx="5" />
          <rect x="260" y="198" width="34" height="34" rx="5" />
          <rect x="92" y="252" width="38" height="34" rx="5" />
          <rect x="148" y="252" width="38" height="34" rx="5" />
        </g>
        <rect x="204" y="252" width="38" height="68" rx="4" fill="#0F1B3D" opacity=".75" />
        <rect x="260" y="252" width="34" height="34" rx="5" fill="#F7FAFF" />
      </g>

      {/* Trees */}
      <g>
        <rect x="866" y="238" width="12" height="82" rx="6" fill="#A9855F" />
        <circle cx="872" cy="208" r="52" fill="#8FB8A2" />
        <circle cx="836" cy="232" r="34" fill="#A5C7B1" />
        <circle cx="908" cy="234" r="32" fill="#A5C7B1" />
      </g>
      <g>
        <rect x="26" y="264" width="9" height="56" rx="4.5" fill="#A9855F" />
        <circle cx="30" cy="244" r="36" fill="#8FB8A2" />
      </g>

      {/* Road */}
      <rect y="320" width="960" height="120" fill="#0F1B3D" />
      <g fill="#F7F9FC" opacity=".7">
        <rect x="40" y="392" width="54" height="7" rx="3.5" />
        <rect x="142" y="392" width="54" height="7" rx="3.5" />
        <rect x="244" y="392" width="54" height="7" rx="3.5" />
        <rect x="346" y="392" width="54" height="7" rx="3.5" />
        <rect x="448" y="392" width="54" height="7" rx="3.5" />
        <rect x="550" y="392" width="54" height="7" rx="3.5" />
        <rect x="652" y="392" width="54" height="7" rx="3.5" />
        <rect x="754" y="392" width="54" height="7" rx="3.5" />
        <rect x="856" y="392" width="54" height="7" rx="3.5" />
      </g>

      {/* Bus shelter + waiting family */}
      <g>
        <rect x="676" y="270" width="6" height="70" rx="3" fill="#0F1B3D" />
        <rect x="684" y="214" width="86" height="8" rx="4" fill="#0F1B3D" />
        <circle cx="727" cy="196" r="16" fill="#F5C518" stroke="#0F1B3D" strokeWidth="3" />
        {/* Tiny bus pictogram instead of a lettered sign, so the art needs no translation. */}
        <rect x="718" y="191" width="18" height="10" rx="2.5" fill="#0F1B3D" />
        <rect x="720.5" y="193.5" width="4" height="3.5" rx="1" fill="#F5C518" />
        <rect x="727" y="193.5" width="4" height="3.5" rx="1" fill="#F5C518" />
        <rect x="718" y="196" width="18" height="2" fill="#F5C518" opacity=".5" />
        <circle cx="719" cy="286" r="15" fill="#DCA57F" />
        <path d="M704 348v-34a15 15 0 0 1 30 0v34Z" fill="#0F1B3D" />
        <circle cx="743" cy="302" r="10" fill="#F1C6A4" />
        <path d="M733 348v-24a10 10 0 0 1 20 0v24Z" fill="#F5C518" />
        <path d="M729 328 719 320" stroke="#0F1B3D" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Bus */}
      <g>
        <rect x="300" y="150" width="370" height="158" rx="26" fill="#F5C518" />
        <rect x="300" y="150" width="370" height="20" rx="10" fill="#FFDF6B" />
        <rect x="300" y="266" width="370" height="42" rx="24" fill="#0F1B3D" />

        {/* Windows */}
        <g fill="#16254E">
          <rect x="322" y="176" width="72" height="56" rx="9" />
          <rect x="406" y="176" width="72" height="56" rx="9" />
          <rect x="490" y="176" width="72" height="56" rx="9" />
          <rect x="574" y="176" width="46" height="56" rx="9" />
        </g>
        <g fill="#F7FAFF" opacity=".18">
          <rect x="330" y="184" width="26" height="40" rx="6" />
          <rect x="414" y="184" width="26" height="40" rx="6" />
          <rect x="498" y="184" width="26" height="40" rx="6" />
        </g>

        {/* Door, trim and lights */}
        <rect x="630" y="176" width="26" height="86" rx="6" fill="#16254E" />
        <rect x="300" y="246" width="370" height="6" fill="#0F1B3D" opacity=".5" />
        <rect x="326" y="284" width="318" height="4" fill="#F5C518" />
        <rect x="660" y="230" width="14" height="14" rx="7" fill="#F7FAFF" />
        <rect x="296" y="228" width="12" height="30" rx="6" fill="#0F1B3D" />
        <rect x="660" y="158" width="24" height="8" rx="4" fill="#0F1B3D" />

        {/* Wheels */}
        <g>
          <circle cx="392" cy="312" r="38" fill="#0F1B3D" />
          <circle cx="392" cy="312" r="17" fill="#9AA7C2" />
          <circle cx="392" cy="312" r="6" fill="#E8EFFA" />
          <circle cx="586" cy="312" r="38" fill="#0F1B3D" />
          <circle cx="586" cy="312" r="17" fill="#9AA7C2" />
          <circle cx="586" cy="312" r="6" fill="#E8EFFA" />
        </g>
      </g>
    </svg>
  );
}

/** Role card illustrations: parent, driver, administrator. */
export function RoleArt({ kind }: { kind: "parent" | "driver" | "admin" }) {
  return (
    <svg className="lp-role-svg" viewBox="0 0 480 270" role="presentation" aria-hidden focusable={false} preserveAspectRatio="xMidYMid slice">
      <rect width="480" height="270" fill="#E9F0FA" />
      <circle cx="392" cy="66" r="86" fill="#F5C518" opacity=".3" />
      <circle cx="78" cy="220" r="54" fill="#D6E2F4" />

      {kind === "parent" && (
        <g>
          {/* Bus stop */}
          <rect x="92" y="96" width="10" height="126" rx="5" fill="#0F1B3D" />
          <rect x="70" y="64" width="54" height="44" rx="10" fill="#F5C518" stroke="#0F1B3D" strokeWidth="4" />
          <rect x="82" y="78" width="30" height="10" rx="3" fill="#0F1B3D" />
          <rect x="82" y="92" width="12" height="8" rx="3" fill="#0F1B3D" />
          <rect x="98" y="92" width="14" height="8" rx="3" fill="#0F1B3D" />

          {/* Adult */}
          <circle cx="238" cy="112" r="28" fill="#DCA57F" />
          <path d="M198 236v-70a40 40 0 0 1 80 0v70Z" fill="#0F1B3D" />
          <path d="M218 178h40v34h-40z" fill="#F7F9FC" opacity=".18" />
          <path d="M198 176 168 208" stroke="#0F1B3D" strokeWidth="18" strokeLinecap="round" />

          {/* Child */}
          <circle cx="306" cy="142" r="20" fill="#F1C6A4" />
          <path d="M282 236v-48a24 24 0 0 1 48 0v48Z" fill="#F5C518" />
          <path d="M292 190h28v46h-28z" fill="#E0B30E" />
          <path d="M282 206 262 216" stroke="#F5C518" strokeWidth="12" strokeLinecap="round" />
          <path d="M254 214c-5 0-8 3-8 8h20c0-5-4-8-12-8Z" fill="#DCA57F" />
          <rect x="310" y="178" width="26" height="34" rx="7" fill="#0F1B3D" />

          {/* Ground */}
          <rect y="236" width="480" height="34" fill="#CBD8EC" />
        </g>
      )}

      {kind === "driver" && (
        <g>
          {/* Window + road */}
          <rect x="250" y="34" width="196" height="112" rx="18" fill="#F7FAFF" />
          <rect x="250" y="104" width="196" height="42" fill="#B9C9E3" />
          <rect x="276" y="128" width="34" height="6" rx="3" fill="#F7FAFF" />
          <rect x="334" y="128" width="34" height="6" rx="3" fill="#F7FAFF" />
          <circle cx="300" cy="82" r="18" fill="#F5C518" opacity=".75" />

          {/* Dashboard */}
          <path d="M0 218c64-26 150-34 246-34h234v86H0Z" fill="#0F1B3D" />
          <rect x="0" y="236" width="480" height="34" fill="#16254E" />

          {/* Seat */}
          <rect x="118" y="118" width="94" height="132" rx="26" fill="#F5C518" />
          <rect x="134" y="138" width="62" height="88" rx="18" fill="#E0B30E" />

          {/* Driver */}
          <circle cx="176" cy="96" r="32" fill="#DCA57F" />
          <path d="M176 62c-22 0-34 14-34 34 0 4 2 7 6 6 8-3 12-12 28-12s20 9 28 12c4 1 6-2 6-6 0-20-12-34-34-34Z" fill="#0F1B3D" />
          <path d="M126 234v-54a50 50 0 0 1 100 0v54Z" fill="#16254E" />
          <path d="M126 196h100" stroke="#F5C518" strokeWidth="6" />
          <path d="M186 196c22 0 34-12 34-34" stroke="#DCA57F" strokeWidth="16" strokeLinecap="round" />

          {/* Steering wheel */}
          <circle cx="256" cy="188" r="52" fill="none" stroke="#F5C518" strokeWidth="14" />
          <circle cx="256" cy="188" r="14" fill="#F5C518" />
          <path d="M256 202v34M204 188h104" stroke="#F5C518" strokeWidth="10" strokeLinecap="round" />
        </g>
      )}

      {kind === "admin" && (
        <g>
          {/* School + bus cards */}
          <rect x="54" y="58" width="150" height="104" rx="18" fill="#F7FAFF" />
          <rect x="76" y="86" width="44" height="34" rx="6" fill="#C9D8EE" />
          <rect x="132" y="86" width="44" height="34" rx="6" fill="#C9D8EE" />
          <rect x="76" y="130" width="100" height="10" rx="5" fill="#DCE7F7" />
          <circle cx="82" cy="72" r="6" fill="#F5C518" />

          <rect x="222" y="40" width="132" height="76" rx="16" fill="#F5C518" />
          <rect x="238" y="56" width="56" height="26" rx="5" fill="#0F1B3D" />
          <circle cx="252" cy="90" r="7" fill="#0F1B3D" />
          <circle cx="282" cy="90" r="7" fill="#0F1B3D" />
          <rect x="304" y="58" width="34" height="8" rx="4" fill="#0F1B3D" opacity=".6" />
          <rect x="304" y="74" width="26" height="8" rx="4" fill="#0F1B3D" opacity=".4" />

          {/* Administrator */}
          <circle cx="256" cy="152" r="30" fill="#DCA57F" />
          <path d="M214 270v-62a42 42 0 0 1 84 0v62Z" fill="#0F1B3D" />
          <rect x="224" y="206" width="16" height="54" rx="8" fill="#F7F9FC" opacity=".14" />
          <path d="M222 218l-18 26" stroke="#0F1B3D" strokeWidth="17" strokeLinecap="round" />

          {/* Tablet */}
          <rect x="288" y="206" width="62" height="46" rx="9" fill="#F7FAFF" stroke="#0F1B3D" strokeWidth="4" />
          <rect x="300" y="218" width="28" height="5" rx="2.5" fill="#0F1B3D" opacity=".5" />
          <rect x="300" y="230" width="38" height="5" rx="2.5" fill="#0F1B3D" opacity=".3" />
          <rect x="300" y="241" width="20" height="5" rx="2.5" fill="#F5C518" />

          <rect y="252" width="480" height="18" fill="#CBD8EC" />
        </g>
      )}
    </svg>
  );
}
